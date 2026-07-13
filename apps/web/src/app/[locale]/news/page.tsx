import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { buildLocalizedAlternates } from "@/i18n/metadata";
import type { PageParams } from "@/types";

import { NewsPage } from "@views/news";

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;

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
