import type { CartOptionSelection } from "../model/types";

const SEPARATOR = ":";

/**
 * 같은 상품 + 같은 옵션 조합이면 항상 같은 id 가 나오게 optionValueId 를 정렬한다.
 * 사용자가 색상 → 사이즈 순으로 고르든 그 반대든 같은 라인으로 합쳐져야 한다.
 */
export const createCartLineId = (
  productId: number,
  options: ReadonlyArray<Pick<CartOptionSelection, "optionValueId">>,
): string => {
  const ids = options
    .map((option) => option.optionValueId)
    .sort((a, b) => a - b)
    .join("-");

  return `${productId}${SEPARATOR}${ids}`;
};

export const getProductIdFromCartLineId = (lineId: string): number | null => {
  const productId = Number(lineId.split(SEPARATOR)[0]);

  return Number.isInteger(productId) && productId > 0 ? productId : null;
};

/** `IVORY / M` 형태의 한 줄 표기. 옵션이 없으면 빈 문자열. */
export const formatCartLineOptions = (
  options: ReadonlyArray<CartOptionSelection>,
): string => options.map((option) => option.value).join(" / ");
