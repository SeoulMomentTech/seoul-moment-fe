import type { GetUserCartRes, UserCartItem } from "@shared/services/userCart";

/** 한 라인의 수량 상한. 재고와 무관한 정책상 천장이다 (web 의 cartPolicy 와 같은 값). */
export const MAX_LINE_QUANTITY = 99;

/**
 * 남은 개수를 알리는 기준. 넉넉할 때 띄우면 잡음이고 재고를 그대로 공개하는 셈이다.
 */
export const LOW_STOCK_THRESHOLD = 10;

/**
 * 이 라인에서 실제로 고를 수 있는 최대 수량 — 정책 천장과 재고 중 작은 쪽.
 * 재고가 0 이어도 1 로 떨어진다(스테퍼 자체는 품절 라인에서 비활성이다).
 */
export const getMaxLineQuantity = (stockQuantity: number): number =>
  Math.max(1, Math.min(MAX_LINE_QUANTITY, stockQuantity));

/**
 * 살 수 없는 라인인지. 서버가 금액 합계에서 빼는 라인은 품절 외의 사유(판매중지 등)도 포함하므로
 * 둘을 함께 본다. 이 라인도 지울 수는 있어야 한다 — 지우는 것 말고 할 수 있는 일이 없다.
 */
export const isCartItemUnavailable = (item: UserCartItem): boolean =>
  item.isSoldOut || !item.isAvailable;

/** 남은 개수를 알릴 만큼 재고가 적은지. 품절은 별도 표기라 제외한다. */
export const isCartItemLowStock = (item: UserCartItem): boolean =>
  !isCartItemUnavailable(item) &&
  item.stockQuantity > 0 &&
  item.stockQuantity < LOW_STOCK_THRESHOLD;

/** 할인가가 유효하면 할인가, 아니면 정상가. 줄 하나에 가격 하나만 쓴다. */
export const getCartItemUnitPrice = (item: UserCartItem): number =>
  item.discountPrice != null &&
  item.discountPrice > 0 &&
  item.discountPrice < item.price
    ? item.discountPrice
    : item.price;

/** 브랜드 묶음을 풀어 라인 하나하나로 본다. 브랜드가 무의미한 계산(비었는지)에 쓴다. */
export const listCartItems = (cart: GetUserCartRes): UserCartItem[] =>
  cart.brandGroups.flatMap((group) => group.items);

/**
 * 화면에 적는 금액. 앱의 다른 화면(ProductCard, MyLikes, 상품 상세)과 같은 표기다.
 *
 * 여기서 하는 계산은 **없다** — 받은 숫자에 통화만 붙인다. 합계·배송비·무료배송까지 남은
 * 금액은 전부 서버가 계산해 내려주는 값이고, 그중 하나라도 화면에서 다시 더하는 순간
 * 서버와 어긋날 수 있다.
 */
export const formatPrice = (value: number) =>
  `NT$${value.toLocaleString("en-US")}`;
