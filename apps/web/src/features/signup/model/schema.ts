import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PASSWORD_RULES } from "@shared/lib/hooks/usePasswordRules";
import { isValidNickname, sanitizeNickname } from "@shared/lib/nickname";

export const RESEND_INITIAL_SECONDS = 28;

/**
 * 닉네임 필드의 값 관계. 입력은 항상 sanitize 되고, 그 결과가 닉네임 규칙을
 * 만족해야 유효하다. 입력 시점의 정리와 제출 시점의 검증이 같은 관계를 쓴다.
 */
export const nicknameSchema = z
  .string()
  .transform(sanitizeNickname)
  .refine(isValidNickname);

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
    nickname: nicknameSchema,
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
