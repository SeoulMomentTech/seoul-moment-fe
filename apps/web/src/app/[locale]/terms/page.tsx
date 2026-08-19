import type { Metadata } from "next";
import * as rootParams from "next/root-params";
import { getTranslations } from "next-intl/server";

import { buildLocalizedAlternates } from "@/i18n/metadata";

import { TermsPage } from "@views/terms";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootParams.locale();

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
