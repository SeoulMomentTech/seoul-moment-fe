import { formatDate } from "date-fns";
import { Mutex } from "es-toolkit";
import type { Options } from "ky";
import ky from "ky";

export const formatDateTime = (datetime: string) =>
  formatDate(new Date(datetime), "yyyy.MM.dd");

export const replaceLineBreaks = (s: string) =>
  s.replace(/(\r\n|\r|\n)/g, "<br/>");

export const splitLineBreaks = (s: string) => s.split(/(\r\n|\r|\n)/g);

export const setComma = (num: number, maximumFractionDigits?: number): string =>
  num.toLocaleString(undefined, {
    maximumFractionDigits: maximumFractionDigits ?? 2,
  });

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
