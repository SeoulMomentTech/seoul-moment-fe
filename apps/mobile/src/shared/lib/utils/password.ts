import type { MessageKey } from "@shared/lib/i18n/translate";

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

/**
 * 규칙 하나와 그것을 사람 말로 적은 줄. 화면에 적히는 순서가 이 배열의 순서다.
 * 글자가 아니라 언어팩 키를 들고 있다 — 이 목록은 화면 밖이라 여기서 번역할 수 없다.
 */
export const PASSWORD_RULE_LABELS: {
  key: PasswordRuleKey;
  labelKey: MessageKey;
}[] = [
  { key: "minLength", labelKey: "minimum_characters" },
  { key: "hasUpper", labelKey: "least_one_uppercase" },
  { key: "hasLower", labelKey: "least_one_lowercase" },
  { key: "hasNumber", labelKey: "least_one_number" },
  { key: "hasSpecial", labelKey: "least_one_special" },
];

export const passwordMeetsRules = (value: string) =>
  PASSWORD_RULE_LABELS.every(({ key }) => PASSWORD_RULES[key](value));
