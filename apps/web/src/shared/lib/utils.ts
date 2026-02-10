import { formatDate } from "date-fns";
import { Mutex } from "es-toolkit";
import type { Options } from "ky";
import ky from "ky";

export const formatDateTime = (
  datetime: string,
  format: string = "yyyy.MM.dd",
) => formatDate(new Date(datetime), format);

export const replaceLineBreaks = (s: string) =>
  s.replace(/(\r\n|\r|\n)/g, "<br/>");

export const splitLineBreaks = (s: string) => s.split(/(\r\n|\r|\n)/g);

export const createMarkup = (content?: string) => ({
  __html: replaceLineBreaks(content ?? ""),
});

export const setComma = (num: number, maximumFractionDigits?: number): string =>
  num.toLocaleString(undefined, {
    maximumFractionDigits: maximumFractionDigits ?? 2,
  });

export const toNTCurrency = (
  num: number,
  maximumFractionDigits?: number,
): string => `NT$${setComma(num, maximumFractionDigits)}`;

export const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>?/gm, " ") // 태그를 공백으로 치환하여 단어 결합 방지
    .replace(/\s+/g, " ") // 다중 공백 및 줄바꿈을 단일 공백으로 축소
    .trim();

const throttleFetchMutex = new Mutex();

export async function throttledFetch(url: string, options?: Options) {
  if (throttleFetchMutex.isLocked) {
    return null;
  }

  await throttleFetchMutex.acquire();
  try {
    const response = await ky.get(url, options).json();
    return response;
  } finally {
    throttleFetchMutex.release();
  }
}

export const isValidExternalUrl = (url: string) => {
  return url.startsWith("http://") || url.startsWith("https://");
};
