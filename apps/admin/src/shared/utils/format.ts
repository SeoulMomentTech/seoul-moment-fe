/** 값이 비었을 때 표에 찍는 기호. 0 과 구분하기 위해 빈 문자열을 쓰지 않는다 */
export const EMPTY_VALUE = "—";

const numberFormatter = new Intl.NumberFormat("ko-KR");

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** ko-KR 은 날짜 끝에 마침표를 남긴다. `2026. 09. 16.` → `2026. 09. 16` */
const trimTrailingDot = (value: string) => value.replace(/\.$/, "");

export const formatNumber = (value: number) => numberFormatter.format(value);

/** 서비스 통화는 대만 달러다. 소수점은 쓰지 않는다 */
export const formatCurrency = (value: number) =>
  `NT$${numberFormatter.format(Math.round(value))}`;

export const formatDate = (value?: string | null) =>
  value ? trimTrailingDot(dateFormatter.format(new Date(value))) : EMPTY_VALUE;

export const formatDateTime = (value?: string | null) =>
  value
    ? trimTrailingDot(dateTimeFormatter.format(new Date(value)))
    : EMPTY_VALUE;

/** `<input type="date">` 에 넣을 수 있는 YYYY-MM-DD 로 자른다 */
export const toDateInputValue = (date: Date) => {
  const offsetMinutes = date.getTimezoneOffset();
  return new Date(date.getTime() - offsetMinutes * 60_000)
    .toISOString()
    .slice(0, 10);
};
