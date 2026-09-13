"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useForm } from "react-hook-form";

import { findZipCode } from "@shared/lib/regions";
import type { UserInfo, UserProfile } from "@shared/services/user";
import type { UserOrderShipping } from "@shared/services/userOrder";

import {
  orderShippingResolver,
  orderShippingSchema,
  toLocalMobile,
  toTaiwanMobileE164,
  type OrderShippingValues,
} from "./schema";

interface UseOrderShippingParams {
  profile?: UserProfile;
  userInfo?: UserInfo;
}

const EMPTY_VALUES: OrderShippingValues = {
  recipientName: "",
  phone: "",
  postalCode: "",
  city: "",
  district: "",
  detailAddress: "",
  requestMessage: "shipping_request_none",
};

/** 기본 배송지가 실제로 배송 가능한 주소인지. 한 칸이라도 비면 체크를 켤 수 없다 */
const isDeliverable = (profile?: UserProfile, phone?: string) =>
  !!profile?.name &&
  !!profile.city &&
  !!profile.district &&
  !!profile.detailAddress &&
  !!phone;

const toFormValues = (
  profile?: UserProfile,
  phone?: string,
): OrderShippingValues => ({
  ...EMPTY_VALUES,
  recipientName: profile?.name ?? "",
  // 입력 칸은 `+886` 뒤 자리만 들고 있다. 프로필에는 어떤 형식으로든 저장돼 있다.
  phone: toLocalMobile(phone ?? ""),
  postalCode:
    profile?.postalCode ?? findZipCode(profile?.city, profile?.district) ?? "",
  city: profile?.city ?? "",
  district: profile?.district ?? "",
  detailAddress: profile?.detailAddress ?? "",
});

/**
 * 주문서 배송지 상태.
 *
 * 기본 배송지를 쓰는 동안에도 **같은 폼 값**을 채워둔다 — 배송비는 縣市·區로 정해지므로
 * 어느 모드든 화면이 읽는 주소가 한 곳이어야 미리보기 호출이 갈라지지 않는다.
 * 프로필이 늦게 도착하면(첫 렌더에는 없다) 그때 한 번 값을 심는다.
 */
export const useOrderShipping = ({
  profile,
  userInfo,
}: UseOrderShippingParams) => {
  const phone = userInfo?.phone;
  const canUseDefault = isDeliverable(profile, phone);

  const form = useForm<OrderShippingValues>({
    resolver: orderShippingResolver,
    defaultValues: EMPTY_VALUES,
    mode: "onBlur",
  });

  const [useDefaultShipping, setUseDefaultShipping] = useState(true);

  const { reset, setValue, watch } = form;

  useEffect(
    function fillFromProfile() {
      if (!canUseDefault || !useDefaultShipping) return;

      reset(toFormValues(profile, phone));
    },
    [canUseDefault, useDefaultShipping, profile, phone, reset],
  );

  const city = watch("city");
  const district = watch("district");

  /** 縣市 를 바꾸면 區 는 더 이상 유효하지 않다. 우편번호도 함께 비운다 */
  const handleCityChange = useCallback(
    (next: string) => {
      setValue("city", next, { shouldValidate: true });
      setValue("district", "");
      setValue("postalCode", "");
    },
    [setValue],
  );

  /** 區 가 정해지면 우편번호는 하나로 결정된다 — 사용자가 외울 이유가 없다 */
  const handleDistrictChange = useCallback(
    (next: string) => {
      setValue("district", next, { shouldValidate: true });
      setValue("postalCode", findZipCode(city, next) ?? "");
    },
    [city, setValue],
  );

  const values = watch();

  /**
   * 필수 항목이 다 찼는지 — `결제하기` 활성 여부가 이 값 하나로 정해진다.
   *
   * 리졸버가 쓰는 스키마로 직접 판정한다. `formState.isValid` 는 기본 배송지를 `reset` 으로
   * 심었을 때 갱신되지 않아 다 채워진 주소에도 false 로 남는다 — `trigger()` 로 깨울 수는
   * 있지만 그러면 손대지도 않은 필드에 에러 문구가 뜬다.
   */
  const isValid = orderShippingSchema.safeParse(values).success;

  /**
   * 서버로 보낼 배송지. 기본 배송지를 쓰면 `shipping` 을 보내지 않는 것이 스웨거 규칙이고,
   * 그 규칙은 `CreateUserOrderReq` 의 유니온 타입이 이미 강제한다.
   */
  const shipping = useMemo<UserOrderShipping>(
    () => ({
      recipientName: values.recipientName.trim(),
      phone: toTaiwanMobileE164(values.phone),
      postalCode: values.postalCode,
      city: values.city,
      district: values.district,
      detailAddress: values.detailAddress.trim(),
    }),
    [values],
  );

  return {
    form,
    /** 프로필에 주소·연락처가 다 있을 때만 기본 배송지를 고를 수 있다 */
    canUseDefault,
    useDefaultShipping: canUseDefault && useDefaultShipping,
    setUseDefaultShipping,
    handleCityChange,
    handleDistrictChange,
    /** 배송비 확정에 필요한 지역. 둘 중 하나라도 비면 미리보기를 부르지 않는다 */
    city,
    district,
    shipping,
    isValid,
  };
};
