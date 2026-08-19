import { hasLocale } from "next-intl";
import { defineRouting } from "next-intl/routing";

import type { LanguageType } from "./const";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["ko", "en", "zh-TW"],
  localePrefix: "always",
  // Used when no locale matches
  defaultLocale: "en",
  localeDetection: false,
});

/**
 * URL 세그먼트에서 읽은 로케일 문자열을 지원 로케일로 좁힌다.
 * `params.locale`과 `rootParams.locale()`은 모두 검증 전 `string`이라
 * `as LanguageType` 단언 대신 이 함수를 거쳐 실제로 narrowing 한다.
 */
export const resolveLocale = (value: string | undefined): LanguageType =>
  hasLocale(routing.locales, value) ? value : routing.defaultLocale;
