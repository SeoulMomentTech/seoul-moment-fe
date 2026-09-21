export type {
  GetUserCartRes,
  UserCartBrandGroup,
  UserCartItem,
} from "@shared/services/userCart";

import type {
  GetUserCartRes,
  UserCartBrandGroup,
  UserCartItem,
} from "@shared/services/userCart";

/**
 * 담기 요청 한 줄.
 *
 * 서버 장바구니는 SKU 단위라 `productVariantId` 가 전부다. 예전처럼 상품명·가격·이미지를
 * 복사해 두지 않는다 — 화면이 읽는 값은 이제 서버 응답이고, 스냅샷은 낡기만 한다.
 * `productVariantId` 를 못 정한 라인은 서버에 담을 방법이 없어 요청 전에 걸러진다.
 */
export interface CartItemDraft {
  productVariantId?: number;
  quantity: number;
}

/**
 * 담기 결과.
 *
 * - `stock` 은 서버가 재고 부족(409)으로 거부한 경우다. 사용자에게 이미 알린 뒤이므로
 *   호출부는 성공 처리만 하지 않으면 된다.
 * - `invalid` 는 고른 조합에 대응하는 SKU 를 찾지 못한 경우다. 서버 장바구니에는 담을
 *   방법이 없으므로 조용히 넘기지 않고 실패로 끝낸다.
 * - `error` 는 그 밖의 실패다. 사용자에게는 이미 알린 뒤이므로 호출부는 성공 처리만
 *   하지 않으면 된다.
 */
export type AddCartItemsOutcome =
  | { status: "added" }
  | { status: "stock" }
  | { status: "invalid" }
  | { status: "error" };

/**
 * 화면이 다루는 장바구니 라인.
 *
 * 회원 라인과 게스트 라인의 유일한 차이는 `cartItemId` 다 — 게스트에는 라인 ID 가 없다.
 * 화면은 라인을 `productVariantId` 로 가리키므로 이 차이를 볼 일이 없다.
 */
export interface CartLine extends Omit<UserCartItem, "cartItemId"> {
  cartItemId: number | null;
}

export interface CartBrandGroup extends Omit<UserCartBrandGroup, "items"> {
  items: CartLine[];
}

export interface GetCartRes extends Omit<GetUserCartRes, "brandGroups"> {
  brandGroups: CartBrandGroup[];
}

/** SKU 가 확정된 담기 라인. 어댑터는 이것만 받는다 */
export interface ResolvedCartItemDraft {
  productVariantId: number;
  quantity: number;
}

/**
 * 회원·게스트 어댑터가 공통으로 만족하는 계약.
 *
 * `useCart` 는 이 인터페이스만 보고, 어느 카트인지 모른다. 실패는 전부 **throw** 로
 * 알린다 — 재고 부족(409) 뒤 정정과 실패 토스트는 `useCart` 한 곳에서 처리한다.
 */
export interface CartApi {
  data?: GetCartRes;
  isPending: boolean;
  isError: boolean;
  refetch(): void;
  /** 409 뒤 정정용 즉시 재조회. 읽지 못하면 `null` */
  fetchCart(): Promise<GetCartRes | null>;
  addItems(items: ReadonlyArray<ResolvedCartItemDraft>): Promise<void>;
  /** 화면(캐시)에만 반영한다. 전송은 하지 않는다 */
  setLineQuantity(productVariantId: number, quantity: number): void;
  /** 서버로 전송한다 */
  commitQuantity(productVariantId: number, quantity: number): Promise<void>;
  /** 고른 라인만 삭제 */
  removeItems(productVariantIds: ReadonlyArray<number>): void;
  /** 전체 비우기 */
  removeAll(): void;
}
