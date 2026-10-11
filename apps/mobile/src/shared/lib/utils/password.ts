/**
 * 계정 비밀번호가 지켜야 하는 다섯 가지. web 의 usePasswordRules 와 같은 판정이다 —
 * 한쪽만 느슨하면 거기서 만든 비밀번호를 다른 쪽이 거절한다.
 *
 * 특수문자 집합도 web 과 같다. 여기 없는 기호(예: `.`)는 특수문자로 치지 않는다.
 */
export const PASSWORD_RULES = {
  minLength: (value: string) => value.length >= 8,
  hasUpper: (value: string) => /[A-Z]/.test(value),
  hasLower: (value: string) => /[a-z]/.test(value),
  hasNumber: (value: string) => /\d/.test(value),
  hasSpecial: (value: string) => /[~#@$%&!*_?\-<>]/.test(value),
} as const;

export type PasswordRuleKey = keyof typeof PASSWORD_RULES;

/** 규칙 하나와 사람이 읽는 말. 화면에 적히는 순서가 이 배열의 순서다. */
export const PASSWORD_RULE_LABELS: { key: PasswordRuleKey; label: string }[] = [
  { key: "minLength", label: "Minimum 8 characters" },
  { key: "hasUpper", label: "At least one uppercase letter" },
  { key: "hasLower", label: "At least one lowercase letter" },
  { key: "hasNumber", label: "At least one number" },
  {
    key: "hasSpecial",
    label: "At least one special character (~ # @ $ % & ! * _ ? - < >)",
  },
];

export const passwordMeetsRules = (value: string) =>
  PASSWORD_RULE_LABELS.every(({ key }) => PASSWORD_RULES[key](value));
