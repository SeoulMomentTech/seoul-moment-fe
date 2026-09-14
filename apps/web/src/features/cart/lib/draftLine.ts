import type { OptionType } from "@shared/services/product";

/** 담기 전 화면에서 고른 옵션값 하나. 라벨은 그 자리에서 보여줄 표시용이다 */
export interface DraftOptionSelection {
  type: OptionType;
  optionValueId: number;
  value: string;
}

const SEPARATOR = ":";

/**
 * 담기 전 조합 목록에서 같은 조합을 하나로 합치기 위한 키.
 *
 * 색상 → 사이즈 순으로 고르든 그 반대든 같은 줄이어야 하므로 `optionValueId` 를 정렬한다
 * (`findProductVariant` 와 같은 규칙). 서버 장바구니의 라인 id 와는 무관한 화면 전용 값이다.
 */
export const createDraftLineKey = (
  productId: number,
  options: ReadonlyArray<Pick<DraftOptionSelection, "optionValueId">>,
): string => {
  const ids = options
    .map((option) => option.optionValueId)
    .sort((a, b) => a - b)
    .join("-");

  return `${productId}${SEPARATOR}${ids}`;
};

/** `IVORY / M` 형태의 한 줄 표기. 옵션이 없으면 빈 문자열. */
export const formatDraftLineOptions = (
  options: ReadonlyArray<DraftOptionSelection>,
): string => options.map((option) => option.value).join(" / ");
