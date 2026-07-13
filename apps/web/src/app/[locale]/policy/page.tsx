import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { buildLocalizedAlternates } from "@/i18n/metadata";
import type { PageParams } from "@/types";

import { PolicyPage } from "@views/policy";

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;

  try {
    const t = await getTranslations();

    return {
      title: t("policy"),
      alternates: buildLocalizedAlternates(locale, "/policy"),
    };
  } catch {
    return {
      alternates: buildLocalizedAlternates(locale, "/policy"),
    };
  }
}

export default function Policy() {
  return <PolicyPage />;
}
