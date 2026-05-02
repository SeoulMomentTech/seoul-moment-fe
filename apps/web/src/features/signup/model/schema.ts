import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const PASSWORD_RULES = {
  minLength: (value: string) => value.length >= 8,
  hasUpper: (value: string) => /[A-Z]/.test(value),
  hasLower: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /\d/.test(value),
  hasSpecial: (value: string) => /[~#@$%&!*_?\-<>]/.test(value),
} as const;

export type PasswordRuleKey = keyof typeof PASSWORD_RULES;

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
    phone: z.string().min(1),
    verificationCode: z.string().min(1),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const signupFormResolver = zodResolver(signupSchema);
