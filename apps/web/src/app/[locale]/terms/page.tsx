import { getTranslations } from "next-intl/server";

import { TermsPage } from "@views/terms";

export async function generateMetadata() {
  try {
    const t = await getTranslations();

    return {
      title: t("terms"),
    };
  } catch {
    return {};
  }
}

export default function Terms() {
  return <TermsPage />;
}
