/** 한 라인의 수량 상한. 재고와 무관한 정책상 천장이다. */
export const MAX_LINE_QUANTITY = 99;

/** 재고가 이보다 적으면 남은 개수를 알린다. 넉넉할 때 띄우면 노이즈이고 재고를 그대로 공개하는 셈이다 */
export const LOW_STOCK_THRESHOLD = 10;

/**
 * 이 라인에서 실제로 고를 수 있는 최대 수량 — 정책 천장과 재고 중 작은 쪽.
 *
 * 재고를 모르면 천장만 적용한다. 모른다는 이유로 1로 묶으면 살 수 있는 수량까지 막힌다.
 */
export const getMaxLineQuantity = (stockQuantity?: number): number =>
  stockQuantity == null
    ? MAX_LINE_QUANTITY
    : Math.max(1, Math.min(MAX_LINE_QUANTITY, stockQuantity));

/** 수량을 정책 범위로 자른다 */
export const clampLineQuantity = (quantity: number, max = MAX_LINE_QUANTITY) =>
  Math.min(Math.max(Math.trunc(quantity), 1), max);
