// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 이미 /{locale}로 시작하면 next-intl만 통과
  if (
    (routing.locales as readonly string[]).some((l) =>
      pathname.startsWith(`/${l}`),
    )
  ) {
    return intl(req);
  }

  // Accept-Language 기반 판별
  const acceptLanguage =
    req.headers.get("accept-language")?.toLowerCase() || "";
  let locale: (typeof routing.locales)[number];

  if (acceptLanguage.startsWith("ko")) {
    locale = "ko";
  } else if (
    acceptLanguage.startsWith("zh-tw") ||
    acceptLanguage.startsWith("zh")
  ) {
    locale = "zh-TW";
  } else {
    locale = "en";
  }

  return NextResponse.redirect(
    new URL(`/${locale}${pathname}${search}`, req.url),
  );
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
