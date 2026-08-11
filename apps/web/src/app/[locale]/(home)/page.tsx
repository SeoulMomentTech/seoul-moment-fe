import type { Metadata } from "next";
import * as rootParams from "next/root-params";

import { buildLocalizedAlternates } from "@/i18n/metadata";

import { HomePage } from "@views/home";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootParams.locale();

  return {
    alternates: buildLocalizedAlternates(locale, ""),
  };
}

export default function Home() {
  return <HomePage />;
}
