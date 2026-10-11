import { useState } from "react";

import { findZipCode } from "@shared/lib/regions";
import { toTaiwanPhoneNumber } from "@shared/lib/utils/phone";
import type { UserInfo, UserProfile } from "@shared/services/user";
import type { UserOrderShipping } from "@shared/services/userOrder";

/** 대만 휴대전화. +886 을 떼고 남은 아홉 자리가 9 로 시작해야 한다 — web 과 같은 규칙이다. */
const isValidPhone = (value: string) =>
  /^\+8869\d{8}$/.test(toTaiwanPhoneNumber(value));

export interface ShippingValues {
  recipientName: string;
  phone: string;
  postalCode: string;
  city: string;
  district: string;
  detailAddress: string;
  requestMessage: string;
}

const EMPTY: ShippingValues = {
  recipientName: "",
  phone: "",
  postalCode: "",
  city: "",
  district: "",
  detailAddress: "",
  requestMessage: "",
};

/** 기본 배송지로 쓸 수 있는 프로필인지. 한 칸이라도 비면 고를 수 없다. */
const isDeliverable = (profile?: UserProfile, phone?: string) =>
  Boolean(
    profile?.name &&
      profile.city &&
      profile.district &&
      profile.detailAddress &&
      phone,
  );

const fromProfile = (
  profile?: UserProfile,
  phone?: string,
): ShippingValues => ({
  ...EMPTY,
  recipientName: profile?.name ?? "",
  phone: phone ?? "",
  postalCode:
    profile?.postalCode || findZipCode(profile?.city, profile?.district) || "",
  city: profile?.city ?? "",
  district: profile?.district ?? "",
  detailAddress: profile?.detailAddress ?? "",
});

/**
 * 주문서 배송지.
 *
 * 기본 배송지를 쓰는 동안에도 **같은 값 묶음**을 채워 둔다 — 배송비는 縣市·區로 정해지므로
 * 어느 쪽을 쓰든 화면이 읽는 주소가 한 곳이어야 미리보기 호출이 갈라지지 않는다.
 * 프로필은 첫 렌더에 없다가 늦게 오므로, 도착하면 그때 한 번 심는다.
 */
export const useOrderShipping = ({
  profile,
  userInfo,
}: {
  profile?: UserProfile;
  userInfo?: UserInfo;
}) => {
  const phone = userInfo?.phone;
  const canUseDefault = isDeliverable(profile, phone);

  const [values, setValues] = useState<ShippingValues>(EMPTY);
  const [useDefault, setUseDefault] = useState(true);
  const [seedKey, setSeedKey] = useState<string | null>(null);

  const usingDefault = canUseDefault && useDefault;

  /**
   * 저장된 배송지를 쓰는 동안의 값 지문. 프로필이 늦게 도착하거나 바뀌면 달라진다.
   * 직접 입력으로 바꾸면 null 이 되어, 돌아왔을 때 다시 심어진다.
   */
  const nextSeedKey = usingDefault
    ? [
        profile?.name,
        profile?.postalCode,
        profile?.city,
        profile?.district,
        profile?.detailAddress,
        phone,
      ].join("|")
    : null;

  // 렌더 중에 보정한다. effect 에서 심으면 한 번 그린 뒤에 값이 들어와, 저장된 주소가
  // 있는데도 빈 칸이 한 프레임 보인다. 직접 입력으로 넘어갈 때는 값을 건드리지 않는다 —
  // 저장된 주소에서 한 칸만 고치는 것이 가장 흔한 일이다.
  if (nextSeedKey !== seedKey) {
    setSeedKey(nextSeedKey);
    if (nextSeedKey !== null) setValues(fromProfile(profile, phone));
  }

  const edit = (patch: Partial<ShippingValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  /** 縣市를 바꾸면 區도 우편번호도 더 이상 그 도시의 것이 아니다. */
  const selectCity = (city: string) =>
    edit({ city, district: "", postalCode: "" });

  /** 區가 정해지면 우편번호는 하나로 결정된다 — 사용자가 외울 이유가 없다. */
  const selectDistrict = (district: string) =>
    edit({ district, postalCode: findZipCode(values.city, district) ?? "" });

  const isValid =
    values.recipientName.trim().length > 0 &&
    isValidPhone(values.phone) &&
    values.postalCode.trim().length >= 3 &&
    values.city.length > 0 &&
    values.district.length > 0 &&
    values.detailAddress.trim().length > 0;

  /** 서버로 보낼 꼴. 번호는 어떻게 입력했든 +886 정규형 하나로 맞춘다. */
  const shipping: UserOrderShipping = {
    recipientName: values.recipientName.trim(),
    phone: isValidPhone(values.phone) ? toTaiwanPhoneNumber(values.phone) : "",
    postalCode: values.postalCode,
    city: values.city,
    district: values.district,
    detailAddress: values.detailAddress.trim(),
    requestMessage: values.requestMessage.trim() || undefined,
  };

  return {
    values,
    edit,
    selectCity,
    selectDistrict,
    canUseDefault,
    useDefault: usingDefault,
    setUseDefault,
    isValid,
    shipping,
  };
};
