import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/** 숫자만 남긴다. `+886 912 345 678` 처럼 사용자가 넣은 공백·기호를 검증에서 배제한다 */
export const toPhoneDigits = (value: string): string =>
  value.replace(/[^0-9]/g, "");

/**
 * 대만 휴대전화 판정. 국가번호(`886`)나 국내 접두(`0`)를 떼고 남은 9 자리가 `9` 로
 * 시작해야 한다 — 시안의 "+886 뒤 9자리" 문구가 그대로 이 규칙이다.
 */
export const isValidTaiwanMobile = (value: string): boolean => {
  const digits = toPhoneDigits(value);
  const local = digits.startsWith("886")
    ? digits.slice(3)
    : digits.replace(/^0/, "");

  return /^9\d{8}$/.test(local);
};

/**
 * 배송 요청사항 선택지. 값으로 i18n 키를 들고 있다 — 실제로 서버에 보내는 문장은
 * 사용자가 보고 고른 언어의 문장이어야 하므로 제출 시점에 번역해 채운다.
 */
export const SHIPPING_REQUEST_KEYS = [
  "shipping_request_none",
  "shipping_request_guard",
  "shipping_request_call",
  "shipping_request_door",
] as const;

export type ShippingRequestKey = (typeof SHIPPING_REQUEST_KEYS)[number];

export const orderShippingSchema = z.object({
  recipientName: z.string().trim().min(1),
  phone: z.string().refine(isValidTaiwanMobile),
  // 縣市·區를 고르면 자동으로 채워지지만, 서버에 보내는 값이라 비어 있으면 통과시키지 않는다.
  postalCode: z.string().trim().min(3),
  city: z.string().trim().min(1),
  district: z.string().trim().min(1),
  detailAddress: z.string().trim().min(1),
  requestMessage: z.enum(SHIPPING_REQUEST_KEYS),
});

export type OrderShippingValues = z.infer<typeof orderShippingSchema>;

export const orderShippingResolver = zodResolver(orderShippingSchema);

/**
 * 필드별 에러 문구 키. zod 스키마에 문장을 넣지 않는 것은 signup 과 같은 방식이다 —
 * 검증 규칙은 스키마가, 문장은 화면이 i18n 으로 들고 있는다.
 */
export const SHIPPING_ERROR_KEY: Record<keyof OrderShippingValues, string> = {
  recipientName: "enter_recipient_name",
  phone: "invalid_phone_format",
  postalCode: "select_region",
  city: "select_region",
  district: "select_region",
  detailAddress: "enter_detail_address",
  requestMessage: "please_try_again",
};
