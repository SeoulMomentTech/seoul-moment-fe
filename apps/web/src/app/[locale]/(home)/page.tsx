import type { Metadata } from "next";

import { buildLocalizedAlternates } from "@/i18n/metadata";
import type { PageParams } from "@/types";

import { HomePage } from "@views/home";

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: buildLocalizedAlternates(locale, ""),
  };
}

export default function Home() {
  return <HomePage />;
}
