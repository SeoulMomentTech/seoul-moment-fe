import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async () => {
  // requestLocale은 요청 스코프라 정적 렌더링을 막고, next-intl에서도 legacy로 분류됐다.
  // [locale]이 root param이므로 next/root-params로 읽으면 프리렌더 중에도 해석된다.
  const paramValue = await rootParams.locale();
  const locale = hasLocale(routing.locales, paramValue)
    ? paramValue
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
