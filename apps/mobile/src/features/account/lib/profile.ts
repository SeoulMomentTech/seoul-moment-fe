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
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  postalCode: string;
  city?: string;
  district?: string;
  detailAddress: string;
}

/** 숫자만 남기고 주어진 자릿수에서 자른다. 폰 키패드로도 기호가 들어올 수 있다. */
export const digitsOnly = (raw: string, max: number) =>
  raw.replace(/\D/g, "").slice(0, max);

export function profileToFormValues(profile: UserProfile): ProfileFormValues {
  // 한 번도 저장하지 않았으면 빈 문자열로 오고, split 결과도 빈 칸 세 개가 된다.
  const [year = "", month = "", day = ""] = (profile.birthDate ?? "").split(
    "-",
  );

  return {
    nickname: profile.nickname ?? "",
    name: profile.name ?? "",
    gender: profile.gender,
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    postalCode: profile.postalCode ?? "",
    city: profile.city || undefined,
    district: profile.district || undefined,
    detailAddress: profile.detailAddress ?? "",
  };
}

const pad2 = (value: string) => value.padStart(2, "0");

/** 세 칸이 모두 차 있을 때만 날짜가 된다. 하나라도 비면 빈 문자열을 보낸다(web 과 같다). */
export const toBirthDate = (values: ProfileFormValues) =>
  values.birthYear && values.birthMonth && values.birthDay
    ? `${values.birthYear}-${pad2(values.birthMonth)}-${pad2(values.birthDay)}`
    : "";

export function formValuesToProfilePayload(
  values: ProfileFormValues,
): UpdateUserProfileReq {
  return {
    // 성별은 필수 필드라 고르지 않았으면 "밝히지 않음"으로 보낸다(web 과 같다).
    gender: values.gender ?? "OTHER",
    birthDate: toBirthDate(values),
    postalCode: values.postalCode.trim(),
    city: values.city ?? "",
    district: values.district ?? "",
    detailAddress: values.detailAddress.trim(),
  };
}

const CURRENT_YEAR = new Date().getFullYear();
const OLDEST_YEAR = CURRENT_YEAR - 120;

/**
 * 생년월일이 지금 상태로 저장될 수 있는지. 세 칸이 모두 비었으면 "아직 안 적음"이라
 * 통과시키고, 일부만 적혔거나 말이 안 되는 날이면 막는다.
 */
export function birthDateProblem(values: ProfileFormValues): string | null {
  const { birthYear: y, birthMonth: m, birthDay: d } = values;
  const filled = [y, m, d].filter((part) => part !== "").length;

  if (filled === 0) return null;
  if (filled < 3) return "Fill in all three date of birth boxes.";

  const year = Number(y);
  const month = Number(m);
  const day = Number(d);

  if (year < OLDEST_YEAR || year > CURRENT_YEAR) {
    return `Enter a birth year between ${OLDEST_YEAR} and ${CURRENT_YEAR}.`;
  }
  if (month < 1 || month > 12) return "Enter a birth month between 1 and 12.";

  // 그 달에 실제로 있는 날인지까지 본다 — 2월 31일은 달력에 없다.
  const lastDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > lastDay) {
    return `Enter a birth day between 1 and ${lastDay}.`;
  }

  return null;
}
