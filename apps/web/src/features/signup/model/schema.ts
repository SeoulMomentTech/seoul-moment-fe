import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PASSWORD_RULES } from "@shared/lib/hooks/usePasswordRules";
import {
  NICKNAME_MAX_LENGTH,
  NICKNAME_MIN_LENGTH,
  NICKNAME_PATTERN,
} from "@shared/lib/nickname";

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
    nickname: z
      .string()
      .min(NICKNAME_MIN_LENGTH)
      .max(NICKNAME_MAX_LENGTH)
      .regex(NICKNAME_PATTERN),
    password: passwordSchema,
    passwordConfirm: z.string(),
    termsOfService: z.boolean().refine((value) => value === true),
    privacyPolicy: z.boolean().refine((value) => value === true),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const signupFormResolver = zodResolver(signupSchema);
