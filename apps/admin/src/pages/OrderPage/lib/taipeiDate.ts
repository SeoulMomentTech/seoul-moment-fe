import { EMPTY_VALUE } from "@shared/utils/format";

// en-CA 는 YYYY-MM-DD 로 찍는다
const taipeiDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const taipeiDateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * 주문 API 의 날짜 필터·"오늘"은 대만 날짜 기준이다. 관리자 PC 가 한국 시간이어도
 * 자정 근처에서 하루가 어긋나지 않게 대만 날짜로 바꾼다.
 */
export const toTaipeiDate = (date: Date) => taipeiDateFormatter.format(date);

/** 결제일시·발주 가능 시각을 대만 시간으로 적는다 */
export const formatTaipeiDateTime = (value?: string | null) =>
  value
    ? taipeiDateTimeFormatter.format(new Date(value)).replace(/\.$/, "")
    : EMPTY_VALUE;
