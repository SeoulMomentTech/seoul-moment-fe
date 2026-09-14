export type {
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
