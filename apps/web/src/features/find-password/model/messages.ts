import type { FindPasswordMethod } from "./schema";

export type VerificationStatus =
  | "idle"
  | "sent"
  | "expired"
  | "verified"
  | "failed";

export type VerificationMessageTone = "info" | "error";

export interface VerificationMessage {
  /** Literal text. Mutually exclusive with `textKey`. */
  text?: string;
  /** i18n message key, resolved via next-intl at render time. */
  textKey?: string;
  tone: VerificationMessageTone;
}

const VERIFIED_KEY_BY_METHOD: Record<FindPasswordMethod, string> = {
  email: "email_verified_success",
  phone: "phone_verified_success",
};

export function getVerificationMessage(
  status: VerificationStatus,
  method: FindPasswordMethod,
): VerificationMessage | null {
  switch (status) {
    case "sent":
      return { textKey: "verification_code_sent", tone: "info" };
    case "verified":
      return { textKey: VERIFIED_KEY_BY_METHOD[method], tone: "info" };
    case "failed":
      return { textKey: "code_not_match", tone: "error" };
    case "expired":
      return { textKey: "code_expired", tone: "error" };
    default:
      return null;
  }
}
