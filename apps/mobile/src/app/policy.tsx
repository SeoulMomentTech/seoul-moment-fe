import { PRIVACY_POLICY } from "@shared/legal/privacy";

import { LegalScreen } from "@features/legal";

export default function PolicyRoute() {
  return <LegalScreen document={PRIVACY_POLICY} title="Privacy policy" />;
}
