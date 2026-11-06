/** 서버의 입금 기한은 UTC ISO 문자열이다. 입금은 대만에서 하므로 대만 시각으로 보여준다 */
const TAIPEI_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** `2026-11-06T15:59:59Z` → `2026/11/06 23:59`. 읽을 수 없는 값은 그대로 돌려준다 */
export const formatTaipeiDateTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    TAIPEI_FORMAT.formatToParts(date).find((p) => p.type === type)?.value ?? "";
  // en-CA 는 24시간제에서 자정을 "24" 로 내는 엔진이 있어 두 자리로 다시 맞춘다
  const hour = part("hour") === "24" ? "00" : part("hour");

  return `${part("year")}/${part("month")}/${part("day")} ${hour}:${part("minute")}`;
};
