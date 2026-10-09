import type { UpdateUserProfileReq, UserProfile } from "@shared/services/user";
import type { ChipOption } from "@shared/ui/chip-row";

export const GENDER_OPTIONS: ChipOption[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other / Prefer not to say" },
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
    birthDate: values.birthDate,
    postalCode: values.postalCode.trim(),
    city: values.city ?? "",
    district: values.district ?? "",
    detailAddress: values.detailAddress.trim(),
  };
}
