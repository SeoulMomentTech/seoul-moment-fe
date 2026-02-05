import { getTranslations } from "next-intl/server";

import { AboutPage } from "@views/about";

export async function generateMetadata() {
  try {
    const t = await getTranslations();

    return {
      title: t("seo_about_us_title"),
      description: t("seo_about_us_description"),
    };
  } catch {
    return {};
  }
}

export default function About() {
  return <AboutPage />;
}
