import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PASSWORD_RULES } from "@shared/lib/hooks/usePasswordRules";

export const RESEND_INITIAL_SECONDS = 28;

const passwordSchema = z
  .string()
  .refine(PASSWORD_RULES.minLength)
  .refine(PASSWORD_RULES.hasUpper)
  .refine(PASSWORD_RULES.hasLower)
  .refine(PASSWORD_RULES.hasNumber)
  .refine(PASSWORD_RULES.hasSpecial);

export const signupSchema = z
  .object({
    email: z.string().email(),
    verificationCode: z.string().min(1),
    isVerified: z.boolean().refine((value) => value === true),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const signupFormResolver = zodResolver(signupSchema);
