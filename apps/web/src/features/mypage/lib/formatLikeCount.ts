import { setComma } from "@shared/lib/utils";

const TEN_THOUSAND = 10_000;

export function formatLikeCount(count: number, locale: string): string {
  if (count >= TEN_THOUSAND) {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(count);
  }
  return setComma(count);
}
