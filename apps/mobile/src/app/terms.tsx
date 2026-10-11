import { TERMS_OF_SERVICE } from "@shared/legal/terms";
import { useTranslations } from "@shared/lib/i18n/useTranslations";

import { LegalScreen } from "@features/legal";

export default function TermsRoute() {
  const t = useTranslations();

  return (
    <LegalScreen document={TERMS_OF_SERVICE} title={t("terms_of_service")} />
  );
}
