import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const VERIFY_CODE_LENGTH = 6;
export const RESEND_INITIAL_SECONDS = 28;
export const PHONE_CODE_DURATION_SECONDS = 30;
export const DEFAULT_COUNTRY_CODE = "+886";

export const verificationSchema = z.object({
  account: z.string().min(1),
  verifyCode: z.string(),
});

export type VerificationFormValues = z.infer<typeof verificationSchema>;

export const verificationFormResolver = zodResolver(verificationSchema);
