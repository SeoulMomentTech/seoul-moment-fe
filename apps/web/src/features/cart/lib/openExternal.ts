import { isValidExternalUrl } from "@shared/lib/utils";

/** 검증을 통과한 외부 몰 URL 만 새 창으로 연다. */
export const openExternalUrl = (url: string) => {
  if (!isValidExternalUrl(url)) return;

  window.open(url, "_blank", "noreferrer");
};
