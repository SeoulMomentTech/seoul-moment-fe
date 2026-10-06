import { TERMS_OF_SERVICE } from "@shared/legal/terms";

import { LegalScreen } from "@features/legal";

export default function TermsRoute() {
  return <LegalScreen document={TERMS_OF_SERVICE} title="Terms of service" />;
}
