import { getTranslations } from "next-intl/server";

import { NewsPage } from "@views/news";

export async function generateMetadata() {
  try {
    const t = await getTranslations();

    return {
      title: t("seo_news_title"),
      description: t("seo_news_description"),
    };
  } catch {
    return {};
  }
}

export default function News() {
  return <NewsPage />;
}
