import type { MetadataRoute } from "next";

// 로케일 프리픽스(localePrefix: "always")가 모든 경로에 붙으므로
// 계정/비공개 경로는 `/*/path` 와일드카드로 전 로케일을 한 번에 차단한다.
const DISALLOWED_ACCOUNT_PATHS = [
  "mypage",
  "login",
  "signup",
  "find-password",
] as const;

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_WEB_URL?.replace(/\/$/, "") ??
    "https://seoulmoment.com.tw";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        ...DISALLOWED_ACCOUNT_PATHS.map((path) => `/*/${path}`),
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
