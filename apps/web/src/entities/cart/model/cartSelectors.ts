import { LOW_STOCK_THRESHOLD } from "./cartPolicy";
import type { UserCartBrandGroup, UserCartItem } from "./types";

/** 브랜드 묶음을 풀어 라인 하나하나로 본다. 선택·전체삭제처럼 브랜드가 무의미한 계산에 쓴다 */
export const listCartItems = (
  brandGroups: ReadonlyArray<UserCartBrandGroup>,
): UserCartItem[] => brandGroups.flatMap((group) => group.items);

/**
 * 살 수 없는 라인인지. 서버가 금액 합계에서 빼는 라인은 품절 외의 사유(판매중지 등)도 포함한다.
 */
export const isCartItemUnavailable = (item: UserCartItem): boolean =>
  item.isSoldOut || !item.isAvailable;

/** 남은 개수를 알릴 만큼 재고가 적은지. 품절은 별도 표기라 제외한다 */
export const isCartItemLowStock = (item: UserCartItem): boolean =>
  !isCartItemUnavailable(item) &&
  item.stockQuantity > 0 &&
  item.stockQuantity < LOW_STOCK_THRESHOLD;

/** 할인가가 유효하면 할인가, 아니면 정상가 */
export const getCartItemUnitPrice = (item: UserCartItem): number =>
  item.discountPrice != null &&
  item.discountPrice > 0 &&
  item.discountPrice < item.price
    ? item.discountPrice
    : item.price;

/**
 * 선택된 라인만의 합계.
 *
 * 서버가 라인마다 `totalPrice`(적용가 × 수량)를 주므로 단가 계산을 여기서 되풀이하지 않는다.
 * 합계 대상은 선택이라는 **클라이언트 상태**라 서버의 `totalProductAmount`(전체 기준)를
 * 그대로 쓸 수 없다.
 */
export const sumSelectedAmount = (
  items: ReadonlyArray<UserCartItem>,
  selectedCartItemIds: ReadonlySet<number>,
): number =>
  items.reduce(
    (total, item) =>
      selectedCartItemIds.has(item.cartItemId)
        ? total + item.totalPrice
        : total,
    0,
  );

export interface ShippingEstimate {
  /** 선택 합계에 적용한 예상 배송비. 무료 구간이면 0 */
  fee: number;
  /** 무료배송까지 남은 금액. 0이면 이미 무료배송이다 */
  amountToFreeShipping: number;
}

/**
 * 선택 합계 기준 배송비 예상값.
 *
 * 서버가 준 `estimatedShippingFee` / `amountToFreeShipping` 은 **장바구니 전체** 기준이라
 * 일부만 선택하면 어긋난다. 규칙(본섬 기준 · 기준액 이상 무료)이 단순하고 확정은 주문서에서
 * 하므로, 화면에 보이는 금액과 맞도록 선택 합계에 다시 적용한다.
 */
export const estimateShipping = ({
  selectedAmount,
  estimatedShippingFee,
  freeShippingThreshold,
}: {
  selectedAmount: number;
  estimatedShippingFee: number;
  freeShippingThreshold: number;
}): ShippingEstimate => {
  // 아무것도 안 골랐으면 배송비를 매길 대상이 없다.
  if (selectedAmount <= 0) return { fee: 0, amountToFreeShipping: 0 };

  const isFree =
    freeShippingThreshold > 0 && selectedAmount >= freeShippingThreshold;

  return {
    fee: isFree ? 0 : estimatedShippingFee,
    amountToFreeShipping: Math.max(0, freeShippingThreshold - selectedAmount),
  };
};
