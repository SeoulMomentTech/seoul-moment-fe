import { useMemo } from "react";

import { PASSWORD_RULES, type PasswordRuleKey } from "./schema";

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
