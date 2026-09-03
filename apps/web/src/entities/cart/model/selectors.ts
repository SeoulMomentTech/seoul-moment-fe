import type { CartBrandGroup, CartLine } from "./types";

/** 할인가가 유효하면 할인가, 아니면 정상가 */
export const getCartLineUnitPrice = (line: CartLine): number =>
  line.discountPrice > 0 && line.discountPrice < line.price
    ? line.discountPrice
    : line.price;

export const getCartLineAmount = (line: CartLine): number =>
  getCartLineUnitPrice(line) * line.quantity;

/**
 * 선택된 라인만의 합계.
 *
 * 배송비는 더하지 않는다 — `shippingCost` 는 상품 단위 값이라 브랜드로 합산하면 부정확하다.
 * 화면에서는 "배송비 브랜드별 별도"로 따로 적는다.
 */
export const sumCartAmount = (
  lines: ReadonlyArray<CartLine>,
  selectedLineIds: ReadonlySet<string>,
): number =>
  lines.reduce(
    (total, line) =>
      selectedLineIds.has(line.lineId)
        ? total + getCartLineAmount(line)
        : total,
    0,
  );

/**
 * 브랜드 단위로 묶는다. 그룹 순서는 각 브랜드의 가장 오래된 라인 기준이라
 * 담을 때마다 그룹이 튀지 않는다.
 */
export const groupCartLinesByBrand = (
  lines: ReadonlyArray<CartLine>,
  selectedLineIds: ReadonlySet<string>,
): CartBrandGroup[] => {
  const groups = new Map<string, CartBrandGroup>();

  for (const line of [...lines].sort((a, b) => a.addedAt - b.addedAt)) {
    const group = groups.get(line.brandId);

    if (group) {
      group.lines.push(line);
      if (selectedLineIds.has(line.lineId)) {
        group.selectedAmount += getCartLineAmount(line);
      }
      continue;
    }

    groups.set(line.brandId, {
      brandId: line.brandId,
      brandName: line.brandName,
      brandProfileImg: line.brandProfileImg,
      lines: [line],
      selectedAmount: selectedLineIds.has(line.lineId)
        ? getCartLineAmount(line)
        : 0,
    });
  }

  return [...groups.values()];
};
