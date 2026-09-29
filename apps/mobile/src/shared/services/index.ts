import ky, { type HTTPError } from "ky";

import {
  hydrateUserAuth,
  useUserAuthStore,
} from "@shared/lib/auth/useUserAuthStore";
import { languageMap, type LanguageType } from "@shared/lib/i18n/language";

export interface PublicLanguageCode {
  languageCode: LanguageType;
}

export interface CommonRes<T> {
  result: boolean;
  data: T;
}

export interface ExtendedHTTPError extends HTTPError {
  isReported?: boolean;
}

const SKIP_AUTH_RETRY_HEADER = "x-skip-auth-retry";

const attachAccessTokenHandler = async (request: Request) => {
  // 앱 시작 직후 요청이 SecureStore 복원보다 먼저 나가면 토큰이 빠진다. 복원 Promise 는
  // 한 번만 만들어지므로 복원이 끝난 뒤에는 즉시 resolve 된다.
  await hydrateUserAuth();

  const accessToken = useUserAuthStore.getState().accessToken;

  if (accessToken && !request.headers.has("Authorization")) {
    request.headers.set("Authorization", `Bearer ${accessToken}`);
  }
};

const beforeRequestHandler = (request: Request) => {
  const { method } = request;

  if (method === "GET") {
    const url = new URL(request.url);
    const languageCode = url.searchParams.get("languageCode") as LanguageType;

    if (languageCode) {
      // 헤더에 추가
      request.headers.set("Accept-language", languageMap[languageCode] ?? "ko");
      url.searchParams.delete("languageCode");
      return new Request(url.toString(), request);
    }
  }
};

const beforeErrorHandler = (error: HTTPError) => {
  const { request, response } = error;

  if (__DEV__ && response && response.status >= 500) {
    // TODO: 에러 리포팅(Sentry 등) 도입 시 web 의 beforeErrorHandler 처럼 여기서 전송하고
    // isReported 를 세운다.
    console.warn(`[api] ${response.status} ${request.method} ${request.url}`);
  }

  return error;
};

const API_PREFIX_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.seoulmoment.com.tw";

// 토큰 재발급 전용 ky 인스턴스. 401 retry hook 이 붙은 메인 api 를 다시 호출하면
// 무한 루프가 되므로, 인증 hook 이 없는 별도 인스턴스로 호출한다.
const refreshApi = ky.create({
  prefixUrl: API_PREFIX_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  retry: 0,
});

interface RefreshTokenResponse {
  oneTimeToken: string;
}

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  const { refreshToken, logout } = useUserAuthStore.getState();

  if (!refreshToken) {
    logout();
    return Promise.resolve(null);
  }

  refreshPromise = refreshApi
    .get("user/auth/one-time-token", {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    })
    .json<CommonRes<RefreshTokenResponse>>()
    .then((res) => {
      const newToken = res.data.oneTimeToken;
      useUserAuthStore.getState().updateAccessToken(newToken);
      return newToken;
    })
    .catch(() => {
      useUserAuthStore.getState().logout();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const afterResponseHandler = async (
  request: Request,
  _options: unknown,
  response: Response,
) => {
  if (response.status !== 401) return response;

  // refresh 요청 자체 / 이미 한 번 재시도된 요청은 추가 retry 안 함
  if (request.headers.get(SKIP_AUTH_RETRY_HEADER) === "1") return response;

  const newToken = await refreshAccessToken();
  if (!newToken) return response;

  const retryRequest = new Request(request);
  retryRequest.headers.set("Authorization", `Bearer ${newToken}`);
  retryRequest.headers.set(SKIP_AUTH_RETRY_HEADER, "1");

  return ky(retryRequest);
};

export const api = ky.create({
  prefixUrl: API_PREFIX_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  hooks: {
    beforeRequest: [attachAccessTokenHandler, beforeRequestHandler],
    afterResponse: [afterResponseHandler],
    beforeError: [beforeErrorHandler],
  },
});
