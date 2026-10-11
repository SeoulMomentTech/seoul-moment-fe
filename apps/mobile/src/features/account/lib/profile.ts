import type { MessageKey } from "@shared/lib/i18n/translate";
import type { UpdateUserProfileReq, UserProfile } from "@shared/services/user";

/** 글자가 아니라 언어팩 키를 들고 있다 — 이 목록은 화면 밖이라 여기서 번역할 수 없다. */
export const GENDER_OPTIONS: { value: string; labelKey: MessageKey }[] = [
  { value: "MALE", labelKey: "male" },
  { value: "FEMALE", labelKey: "female" },
  { value: "OTHER", labelKey: "other" },
];

/** 닉네임 규칙은 가입 화면과 같다. 자세한 판정은 서버가 한다. */
export const NICKNAME_RULE = /^[A-Za-z0-9]{2,20}$/;
export const NICKNAME_MAX_LENGTH = 20;
/** 대만 우편번호는 3자리거나 5자리다. web 과 같이 6까지 받아 둔다. */
export const POSTAL_CODE_MAX_LENGTH = 6;

export interface ProfileFormValues {
  nickname: string;
  name: string;
  gender?: UserProfile["gender"];
  /** YYYY-MM-DD. 빈 문자열이면 아직 고르지 않은 것이다. */
  birthDate: string;
  postalCode: string;
  city?: string;
  district?: string;
  detailAddress: string;
}

/** 숫자만 남기고 주어진 자릿수에서 자른다. 폰 키패드로도 기호가 들어올 수 있다. */
export const digitsOnly = (raw: string, max: number) =>
  raw.replace(/\D/g, "").slice(0, max);

export function profileToFormValues(profile: UserProfile): ProfileFormValues {
  return {
    nickname: profile.nickname ?? "",
    name: profile.name ?? "",
    gender: profile.gender,
    birthDate: profile.birthDate ?? "",
    postalCode: profile.postalCode ?? "",
    city: profile.city || undefined,
    district: profile.district || undefined,
    detailAddress: profile.detailAddress ?? "",
  };
}

export function formValuesToProfilePayload(
  values: ProfileFormValues,
): UpdateUserProfileReq {
  return {
    // 성별은 필수 필드라 고르지 않았으면 "밝히지 않음"으로 보낸다(web 과 같다).
    gender: values.gender ?? "OTHER",
    // 아직 고른 적 없는 생일은 **보내지 않는다**. 빈 문자열을 날짜 자리에 넣으면
    // 서버가 그것을 날짜로 읽어 오늘로 굳어진다 — "설정 안 함"과 "오늘이 생일"이
    // 구분되지 않게 된다. PATCH 의 칸은 전부 선택이라 빼면 그대로 둔다는 뜻이다.
    ...(values.birthDate ? { birthDate: values.birthDate } : null),
    postalCode: values.postalCode.trim(),
    city: values.city ?? "",
    district: values.district ?? "",
    detailAddress: values.detailAddress.trim(),
  };
}
