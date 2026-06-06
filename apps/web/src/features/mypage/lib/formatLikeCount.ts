import { setComma } from "@shared/lib/utils";

const TEN_THOUSAND = 10_000;

export function formatLikeCount(count: number): string {
  if (count >= TEN_THOUSAND) {
    return `${(count / TEN_THOUSAND).toFixed(1)}만`;
  }
  return setComma(count);
}
