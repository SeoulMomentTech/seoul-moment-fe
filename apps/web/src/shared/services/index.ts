import ky, { type HTTPError } from "ky";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { languageMap, type LanguageType } from "@/i18n/const";

import * as Sentry from "@sentry/nextjs";

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

const attachAccessTokenHandler = (request: Request) => {
  // SSR 시 useUserAuthStore.getState() 도 안전 (persist storage 가 undefined 라
  // localStorage 접근 안 함). accessToken 은 클라이언트 hydration 이후에만 채워진다.
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

const beforeErrorHandler = async (error: HTTPError) => {
  const { request, response } = error;

  if (error.response && error.response.status >= 500) {
    const contentType = response.headers.get("content-type");
    const responseData =
      contentType?.includes("application/json") && response.body
        ? await response
            .clone()
            .json()
            .catch(() => undefined)
        : null;

    Sentry.withScope((scope) => {
      scope.setTag("API", "Internal Server Error");
      scope.setContext("API Request", {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers),
      });

      scope.setContext("API Response", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
        data: responseData,
      });
      Sentry.captureException(error);
    });

    // 이미 Sentry에 전송되었음을 표시하여 중복 전송 방지
    (error as ExtendedHTTPError).isReported = true;
  }

  return Promise.reject(error);
};

const API_PREFIX_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.seoulmoment.com.tw";

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
