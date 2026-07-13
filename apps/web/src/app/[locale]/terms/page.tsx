import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { buildLocalizedAlternates } from "@/i18n/metadata";
import type { PageParams } from "@/types";

import { TermsPage } from "@views/terms";

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;

  try {
    const t = await getTranslations();

    return {
      title: t("terms"),
      alternates: buildLocalizedAlternates(locale, "/terms"),
    };
  } catch {
    return {
      alternates: buildLocalizedAlternates(locale, "/terms"),
    };
  }
}

export default function Terms() {
  return <TermsPage />;
}
