import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@seoul-moment/ui"],
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  async redirects() {
    return [
      // /magazine 및 하위 경로(상세 포함) 접근 시 메인으로 임시 리다이렉트.
      // localePrefix가 "always"라 미들웨어가 locale을 먼저 보정하므로 source에 locale 세그먼트 포함.
      {
        source: "/:locale(ko|en|zh-TW)/magazine/:path*",
        destination: "/:locale",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**", // 모든 경로 허용
      },
      {
        protocol: "https",
        hostname: "image-dev.seoulmoment.com.tw",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 86400,
  },
  productionBrowserSourceMaps: true,
  // TS 7은 컴파일러 API를 제공하지 않아(안정 API는 7.1 예정) typescript-eslint 등이 쓰지 못한다.
  // 그래서 `typescript` 이름은 @typescript/typescript6(TS 6 API)에 묶어두고, 실제 TS 7은
  // @typescript/native alias로 설치해 `tsc` CLI만 가져간다.
  // 그런데 Next 16의 기본값(experimental.useTypeScriptCli: true)은 `typescript` 패키지의
  // bin.tsc를 찾아 spawn하는데 호환 패키지에는 tsc6뿐이라 빌드가 깨진다. 그래서 API 모드로 되돌린다.
  // → next build의 타입체크는 TS 6로 수행된다(변경 전과 동일). TS 7.1에서 안정 API가 나오면 이 옵션 제거 검토.
  experimental: {
    useTypeScriptCli: false,
  },
};

const withNextIntl = createNextIntlPlugin();
const sentryBuildOptions = {
  org: "seoulmoment",
  project: "seoulmoment-service-fe",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
};

export default withSentryConfig(withNextIntl(nextConfig), sentryBuildOptions);
