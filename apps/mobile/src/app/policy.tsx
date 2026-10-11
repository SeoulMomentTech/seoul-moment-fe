import { PRIVACY_POLICY } from "@shared/legal/privacy";
import { useTranslations } from "@shared/lib/i18n/useTranslations";

import { LegalScreen } from "@features/legal";

export default function PolicyRoute() {
  const t = useTranslations();

  return <LegalScreen document={PRIVACY_POLICY} title={t("privacy_policy")} />;
}
