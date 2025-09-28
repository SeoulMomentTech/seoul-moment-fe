import { formatDate } from "date-fns";

export const formatDateTime = (datetime: string) =>
  formatDate(new Date(datetime), "yyyy.MM.dd");

export const replaceLineBreaks = (s: string) =>
  s.replace(/(\r\n|\r|\n)/g, "<br/>");

export const setComma = (num: number, maximumFractionDigits?: number): string =>
  num.toLocaleString(undefined, {
    maximumFractionDigits: maximumFractionDigits ?? 2,
  });
