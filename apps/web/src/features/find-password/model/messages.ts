import type { FindPasswordMethod } from "./schema";

export type VerificationStatus =
  | "idle"
  | "sent"
  | "expired"
  | "verified"
  | "failed";

export type VerificationMessageTone = "info" | "error";

export interface VerificationMessage {
  text: string;
  tone: VerificationMessageTone;
}

const VERIFIED_MESSAGE_BY_METHOD: Record<FindPasswordMethod, string> = {
  email: "Email verified successfully.",
  phone: "Phone number verified successfully.",
};

export function getVerificationMessage(
  status: VerificationStatus,
  method: FindPasswordMethod,
): VerificationMessage | null {
  switch (status) {
    case "sent":
      return { text: "Verification code has been sent.", tone: "info" };
    case "verified":
      return { text: VERIFIED_MESSAGE_BY_METHOD[method], tone: "info" };
    case "failed":
      return {
        text: "Code is incorrect, Please check again..",
        tone: "error",
      };
    case "expired":
      return { text: "Expired. Try again.", tone: "error" };
    default:
      return null;
  }
}
