export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;

/** 닉네임은 영문, 숫자만 허용 */
export const NICKNAME_PATTERN = /^[A-Za-z0-9]+$/;

/** 영문/숫자 외 문자를 제거하고 최대 길이로 자른다. */
export const sanitizeNickname = (value: string) =>
  value.replace(/[^A-Za-z0-9]/g, "").slice(0, NICKNAME_MAX_LENGTH);
