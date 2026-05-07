import { useMemo } from "react";

export const PASSWORD_RULES = {
  minLength: (value: string) => value.length >= 8,
  hasUpper: (value: string) => /[A-Z]/.test(value),
  hasLower: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /\d/.test(value),
  hasSpecial: (value: string) => /[~#@$%&!*_?\-<>]/.test(value),
} as const;

export type PasswordRuleKey = keyof typeof PASSWORD_RULES;

export type PasswordRuleStatus = Record<PasswordRuleKey, boolean>;

export function usePasswordRules(value: string): PasswordRuleStatus {
  return useMemo(
    () => ({
      minLength: PASSWORD_RULES.minLength(value),
      hasUpper: PASSWORD_RULES.hasUpper(value),
      hasLower: PASSWORD_RULES.hasLower(value),
      hasNumber: PASSWORD_RULES.hasNumber(value),
      hasSpecial: PASSWORD_RULES.hasSpecial(value),
    }),
    [value],
  );
}
