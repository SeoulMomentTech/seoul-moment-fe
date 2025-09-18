import ky from "ky";
import type { LanguageType } from "@/i18n/const";
import { languageMap } from "@/i18n/const";

export interface PublicLanguageCode {
  languageCode: LanguageType;
}

export interface CommonRes<T> {
  result: boolean;
  data: T;
}

export const api = ky.create({
  prefixUrl: "https://api.seoulmoment.com.tw",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  hooks: {
    beforeRequest: [
      (request) => {
        const { method } = request;

        if (method === "GET") {
          const url = new URL(request.url);
          const languageCode = url.searchParams.get(
            "languageCode",
          ) as LanguageType;

          if (languageCode) {
            // 헤더에 추가
            request.headers.set(
              "Accept-language",
              languageMap[languageCode] ?? "ko",
            );
          }
        }
      },
    ],
  },
});
