import { getTranslations } from "next-intl/server";

import { PolicyPage } from "@views/policy";

export async function generateMetadata() {
  try {
    const t = await getTranslations();

    return {
      title: t("policy"),
    };
  } catch {
    return {};
  }
}

export default function Policy() {
  return <PolicyPage />;
}
