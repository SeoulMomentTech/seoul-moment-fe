import type { Metadata } from "next";
import * as rootParams from "next/root-params";
import { getTranslations } from "next-intl/server";

import { buildLocalizedAlternates } from "@/i18n/metadata";

import { NewsPage } from "@views/news";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootParams.locale();

  try {
    const t = await getTranslations();

    return {
      title: t("seo_news_title"),
      description: t("seo_news_description"),
      alternates: buildLocalizedAlternates(locale, "/news"),
    };
  } catch {
    return {
      alternates: buildLocalizedAlternates(locale, "/news"),
    };
  }
}

export default function News() {
  return <NewsPage />;
}
