import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { buildLocalizedAlternates } from "@/i18n/metadata";
import type { PageParams } from "@/types";

import { AboutPage } from "@views/about";

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;

  try {
    const t = await getTranslations();

    return {
      title: t("seo_about_us_title"),
      description: t("seo_about_us_description"),
      alternates: buildLocalizedAlternates(locale, "/about"),
    };
  } catch {
    return {
      alternates: buildLocalizedAlternates(locale, "/about"),
    };
  }
}

export default function About() {
  return <AboutPage />;
}
