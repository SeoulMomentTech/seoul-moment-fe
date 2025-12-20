import ky, { type HTTPError } from "ky";

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
    // To avoid "Body has already been used" error, we need to clone the request/response
    // before reading the body.
    const requestData = request.body
      ? await request
          .clone()
          .json()
          .catch(() => "Could not parse request body")
      : null;
    const responseData = response.body
      ? await response
          .clone()
          .json()
          .catch(() => "Could not parse response body")
      : null;

    Sentry.withScope((scope) => {
      scope.setTag("API", "Internal Server Error");
      scope.setContext("API Request", {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers),
        data: requestData,
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

export const api = ky.create({
  prefixUrl: "https://api.seoulmoment.com.tw",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  hooks: {
    beforeRequest: [beforeRequestHandler],
    beforeError: [beforeErrorHandler],
  },
});
