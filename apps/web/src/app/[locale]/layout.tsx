import type { PropsWithChildren } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { BASE_URL } from "@shared/constants/env";
import GlobalQueryHandler from "@shared/lib/components/GlobalQueryHandler";
import { ReactQueryProvider } from "@shared/lib/providers";
import ScrollRestoration from "@shared/ui/scroll-restoration";

import { routing } from "@/i18n/routing";

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
      <body className="antialiased">
        <ScrollRestoration />
        <NuqsAdapter>
          <NextIntlClientProvider messages={messages}>
            <ReactQueryProvider>
              <Header />
              <main className="mx-auto min-h-[calc(100vh-200px)] bg-white">
                {children}
                <Toaster />
                <GlobalQueryHandler />
              </main>
              <Footer />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
