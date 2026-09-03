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

/** 담기 요청 단위. `lineId` 와 `addedAt` 은 스토어가 채운다. */
export type CartLineDraft = Omit<CartLine, "lineId" | "addedAt">;

export interface CartBrandGroup {
  brandId: string;
  brandName: string;
  brandProfileImg: string;
  lines: CartLine[];
  /** 이 브랜드에서 선택된 라인만의 합계 */
  selectedAmount: number;
}

export type AddCartLinesResult =
  | { status: "added"; count: number }
  | { status: "limit"; max: number };
