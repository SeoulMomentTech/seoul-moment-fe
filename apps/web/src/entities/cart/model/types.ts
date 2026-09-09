import type { External, OptionType } from "@shared/services/product";

export interface CartOptionSelection {
  type: OptionType;
  optionValueId: number;
  /** 표시용 스냅샷. 서버 API 전환 시 서버 응답으로 대체된다. */
  value: string;
}

export interface CartLine {
  /** `${productId}:${정렬된 optionValueId join "-"}` — 같은 조합은 같은 라인 */
  lineId: string;
  productId: number;
  quantity: number;
  addedAt: number;

  /**
   * 이 라인이 가리키는 SKU. 담을 때 고른 조합에서 그대로 온다.
   *
   * 삭제를 되돌릴 때 서버에 다시 담으려면 이게 있어야 한다 — `lineId` 는 옵션값 조합이라
   * SKU 로 되짚을 수 없다. `variants` 를 못 받은 상품은 비어 있고, 그런 라인은 로컬에만 산다.
   */
  productVariantId?: number;
  /**
   * 서버 장바구니에서의 이 라인 id. 담기 응답이 오면 채워진다.
   *
   * 수량 변경(`PATCH user/cart/{id}`)과 삭제(`DELETE user/cart?ids=`)가 이 값을 쓴다.
   * 서버 담기가 실패했거나 아직 응답 전이면 비어 있고, 그 라인은 서버에 반영하지 않는다.
   */
  cartItemId?: number;

  /**
   * 담은 시점 스냅샷.
   *
   * `getProductList` 에 id 배열 필터가 없어서 담긴 상품들을 한 번에 재조회할 수 없고,
   * 라인마다 `getProductDetail` 을 치면 N+1 이다. 그래서 표시에 필요한 값을 복사해 둔다 —
   * 가격이 바뀌면 stale 해지므로 화면에 "담은 시점 가격 기준" 각주를 둔다.
   */
  productName: string;
  brandId: string;
  brandName: string;
  brandProfileImg: string;
  imageUrl: string;
  price: number;
  discountPrice: number;
  options: CartOptionSelection[];
  external: External[];
}

/**
 * 담기 요청 단위. `lineId` 와 `addedAt` 은 스토어가, `cartItemId` 는 서버 응답이 채운다.
 */
export type CartLineDraft = Omit<CartLine, "lineId" | "addedAt" | "cartItemId">;

export interface CartBrandGroup {
  brandId: string;
  brandName: string;
  brandProfileImg: string;
  lines: CartLine[];
  /** 이 브랜드에서 선택된 라인만의 합계 */
  selectedAmount: number;
}

/** 로컬 스토어만으로 판정할 수 있는 결과 */
export type AddCartLinesResult =
  | { status: "added"; count: number }
  | { status: "limit"; max: number };

/**
 * 서버 응답까지 반영한 담기 결과.
 *
 * `stock` 은 서버가 재고 부족(409)으로 거부한 경우다 — 로컬에는 이미 정정이 끝났고
 * 사용자에게도 알린 뒤이므로, 호출부는 성공 처리만 하지 않으면 된다.
 */
export type AddCartLinesOutcome = AddCartLinesResult | { status: "stock" };
