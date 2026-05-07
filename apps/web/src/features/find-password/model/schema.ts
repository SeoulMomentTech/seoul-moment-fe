import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PASSWORD_RULES } from "@shared/lib/hooks/usePasswordRules";

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

const passwordSchema = z
  .string()
  .refine(PASSWORD_RULES.minLength)
  .refine(PASSWORD_RULES.hasUpper)
  .refine(PASSWORD_RULES.hasLower)
  .refine(PASSWORD_RULES.hasNumber)
  .refine(PASSWORD_RULES.hasSpecial);

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const resetPasswordFormResolver = zodResolver(resetPasswordSchema);
