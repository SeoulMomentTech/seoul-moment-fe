import type { PropsWithChildren } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { ADSENSE_CLIENT } from "@shared/constants/ads";
import { BASE_URL } from "@shared/constants/env";
import GlobalQueryHandler from "@shared/lib/components/GlobalQueryHandler";
import { ReactQueryProvider } from "@shared/lib/providers";
import ScrollRestoration from "@shared/ui/scroll-restoration";

import { routing } from "@/i18n/routing";

import { Chatbot } from "@widgets/chatbot";
import { Footer } from "@widgets/footer";
import { Header } from "@widgets/header";

import "../globals.css";

interface Props {
  params: Promise<{
    locale?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const t = await getTranslations();

    return {
      metadataBase: new URL(BASE_URL),
      title: t("seo_main_title"),
      description: t("seo_main_description"),
      openGraph: {
        title: t("seo_main_title"),
        description: t("seo_main_description"),
        images: [
          {
            url: "/og-image.png",
            width: 1200,
            height: 630,
            alt: "Seoul Moment OG Image",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: t("seo_main_title"),
        description: t("seo_main_description"),
        images: ["/og-image.png"],
      },
    };
  } catch {
    return {};
  }
}

export default async function RootLayout({
  children,
  params,
}: PropsWithChildren<Props>) {
  const { locale } = await params;
  const messages = await getMessages();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale ?? routing.defaultLocale}>
      <head>
        <meta
          content="tkdfXJ6-ynp9D_0x2zpVyESgoJIA3YtbN5LxrpjEGxQ"
          name="google-site-verification"
        />
        <Script
          async
          defer
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        {process.env.NEXT_PUBLIC_ENV === "production" && (
          <>
            <script
              async
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            />
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-N4PST9C2ZV"
              strategy="afterInteractive"
            />
            <Script
              dangerouslySetInnerHTML={{
                __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-N4PST9C2ZV');  
            `,
              }}
              id="gtag-init"
              strategy="afterInteractive"
            />
            <Script id="clarity-init" strategy="afterInteractive">
              {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vjl57tc6vp");
            `}
            </Script>
          </>
        )}
      </head>
      {/* 브라우저 확장(비밀번호 관리자·번역기 등)이 <body>에 속성을 주입해
          하이드레이션 경고가 발생하는 것을 막는다. 이 요소의 속성 diff만
          건너뛰며, 자식 콘텐츠의 불일치는 그대로 검출된다. */}
      <body className="antialiased" suppressHydrationWarning>
        <ScrollRestoration />
        <NuqsAdapter>
          <NextIntlClientProvider messages={messages}>
            <ReactQueryProvider>
              <Header />
              <main className="mx-auto min-h-[calc(100vh-200px)] bg-white">
                {children}
                {/*
                  sonner 는 기본 position 이 bottom-right 이고 z-index 가
                  999999999 다. 챗봇 런처가 우하단이라 그대로 두면 토스트가
                  런처를 덮고 클릭/탭까지 먹는다.

                  데스크탑: 챗봇이 비운 좌하단으로 옮긴다. 오프셋을 밀어내는
                  것보다 코너를 나누는 쪽이 구조적으로 안전하다.
                  (`offset` prop 은 쓰지 않는다 — 객체 값을 주면 **webkit 에서
                  페이지 load 이벤트가 끝나지 않는다**. 실측: Safari 에서
                  page.reload() 가 30s 타임아웃, 같은 값을 제거하면 통과.)

                  모바일: sonner 는 600px 이하에서 width:100% 로 깔려 좌측
                  정렬로도 런처를 덮는다. 그래서 모바일만 런처 위로 올린다.
                */}
                <Toaster mobileOffset={{ bottom: 88 }} position="bottom-left" />
                <GlobalQueryHandler />
              </main>
              <Footer />
              {/* 전역 크롬이므로 main 안이 아니라 Header/Footer 의 형제로 둔다.
                  Footer 다음 = 문서 마지막이라, 키보드 사용자가 푸터 마지막
                  링크에서 Tab 한 번으로 런처에 닿는다. */}
              <Chatbot />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
