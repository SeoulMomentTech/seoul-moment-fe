import type { PropsWithChildren } from "react";

import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { ReactQueryProvider } from "@shared/lib/providers";
import ScrollToTop from "@shared/ui/scroll-to-top";

import { routing } from "@/i18n/routing";

import { Footer } from "@widgets/footer";
import { Header } from "@widgets/header";

import "../globals.css";

interface Props {
  params: Promise<{
    locale?: string;
  }>;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  try {
    const t = await getTranslations();

    return {
      title: t("seo_main_title"),
      description: t("seo_main_description"),
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
    <html lang={locale ?? "ko"}>
      <head>
        {process.env.NODE_ENV === "production" && (
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
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollToTop />
        <NuqsAdapter>
          <NextIntlClientProvider messages={messages}>
            <ReactQueryProvider>
              <Header />
              <main className="mx-auto min-h-[calc(100vh-200px)] bg-white">
                {children}
                <Toaster />
              </main>
              <Footer />
            </ReactQueryProvider>
          </NextIntlClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
