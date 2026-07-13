import type { Metadata } from "next";

import { BASE_URL } from "@shared/constants/env";

import { routing } from "./routing";

const localeUrl = (locale: string, path: string) =>
  `${BASE_URL}/${locale}${path}`;

/**
 * 로케일별 자기 참조 canonical + 전 로케일 hreflang alternates 를 생성한다.
 * sitemap.ts 의 buildLanguages 와 동일한 규칙을 페이지 <head> 메타데이터용으로 재사용.
 *
 * @param locale 현재 페이지 로케일
 * @param path   로케일 프리픽스를 제외한 경로. 홈은 "", 그 외 "/news/1" 처럼 슬래시로 시작.
 */
export const buildLocalizedAlternates = (
  locale: string,
  path: string,
): NonNullable<Metadata["alternates"]> => ({
  canonical: localeUrl(locale, path),
  languages: {
    ...Object.fromEntries(
      routing.locales.map((supportedLocale) => [
        supportedLocale,
        localeUrl(supportedLocale, path),
      ]),
    ),
    "x-default": localeUrl(routing.defaultLocale, path),
  },
});
