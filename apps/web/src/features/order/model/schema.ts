import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/** 숫자만 남긴다. `+886 912 345 678` 처럼 사용자가 넣은 공백·기호를 검증에서 배제한다 */
export const toPhoneDigits = (value: string): string =>
  value.replace(/[^0-9]/g, "");

/**
 * 어떻게 입력했든 국내 9 자리(`9xxxxxxxx`)로 맞춘다. 국제전화 접두(`00`) → 국가번호(`886`)
 * → 국내 접두(`0`) 순으로 걷어낸다.
 *
 * 세 가지를 차례로 보는 이유는 사용자가 섞어 쓰기 때문이다 — 저장해 둔 `0912...` 를
 * `+886` placeholder 뒤에 그대로 붙여넣은 `+886 0912 345 678` 이 대표적이다.
 */
export const toLocalMobile = (value: string): string => {
  const digits = toPhoneDigits(value).replace(/^00/, "");
  const local = digits.startsWith("886") ? digits.slice(3) : digits;

  return local.replace(/^0/, "");
};

/**
 * 입력 칸에 남길 문자열. 칸 왼쪽에 `+886` 이 붙어 있으므로 그 뒤 자리만 받는다.
 *
 * 국가번호를 떼는 것은 자리수가 10 을 넘을 때뿐이다 — 손으로 `886...` 을 쳐 나가는 도중
 * 세 자리째에서 입력이 통째로 사라지면 안 된다. 자동완성이나 붙여넣기로 `+886912345678`
 * 이 한 번에 들어오면 그때 접두가 걷힌다.
 *
 * 길이는 자르지 않는다. 잘라내면 너무 긴 번호가 조용히 맞는 번호로 둔갑한다 —
 * 자리수가 어긋나는 것은 검증이 잡아 문구로 알려야 한다.
 */
export const toPhoneInput = (value: string): string => {
  const digits = toPhoneDigits(value).replace(/^00/, "");

  return digits.length > 10 && digits.startsWith("886")
    ? digits.slice(3)
    : digits;
};

/**
 * 대만 휴대전화 판정. 걷어내고 남은 9 자리가 `9` 로 시작해야 한다 — 시안의
 * "+886 뒤 9자리" 문구가 그대로 이 규칙이다.
 */
export const isValidTaiwanMobile = (value: string): boolean =>
  /^9\d{8}$/.test(toLocalMobile(value));

/**
 * 서버가 받는 정규형 `+886NNNNNNNNN`. 어떻게 입력했든 한 문자열로 맞춘다 — 판정에만
 * 정규화를 쓰고 제출은 입력 그대로 보내면, 같은 번호가 주문마다 다르게 쌓인다.
 *
 * 유효하지 않으면 빈 문자열이다. 절반만 정규화된 값에 `+886` 을 붙여 보내지 않는다.
 */
export const toTaiwanMobileE164 = (value: string): string =>
  isValidTaiwanMobile(value) ? `+886${toLocalMobile(value)}` : "";

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
