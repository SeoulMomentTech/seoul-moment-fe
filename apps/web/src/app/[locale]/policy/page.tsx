import type { Metadata } from "next";
import * as rootParams from "next/root-params";
import { getTranslations } from "next-intl/server";

import { buildLocalizedAlternates } from "@/i18n/metadata";

import { PolicyPage } from "@views/policy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootParams.locale();

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
