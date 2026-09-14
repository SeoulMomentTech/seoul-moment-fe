import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

export interface CreateUserCartItem {
  /** 상품 변형(SKU) ID. 상품 상세 v1 응답의 variants[].id */
  productVariantId: number;
  quantity: number;
}

export interface CreateUserCartItemsReq {
  /**
   * 담을 SKU 목록. 한 개만 담을 때도 길이 1 배열로 보낸다.
   * 같은 SKU 가 두 번 들어오면 서버가 수량을 합쳐서 처리한다.
   */
  items: CreateUserCartItem[];
}

export interface CreatedUserCartItem {
  productVariantId: number;
  cartItemId: number;
  /** 합산된 뒤의 라인 수량. 이미 담겨 있던 수량이 더해진 값이다 */
  quantity: number;
}

export interface CreateUserCartItemsRes {
  /** 담긴 라인. 요청한 순서를 그대로 지킨다 */
  items: CreatedUserCartItem[];
  /** 담긴 뒤의 장바구니 라인 수. 헤더 뱃지를 바로 갱신하라고 함께 준다 */
  totalCount: number;
}

/**
 * @description 장바구니 담기 (단건 · 다건). 이미 담긴 SKU 면 라인을 늘리지 않고 수량을
 * 더한다. 하나라도 담을 수 없으면 전부 담지 않는다 — 재고가 모자라면 409 가 온다.
 */
export const createUserCartItems = (data: CreateUserCartItemsReq) =>
  api
    .post("user/cart", {
      json: data,
    })
    .json<CommonRes<CreateUserCartItemsRes>>();

export interface UserCartItem {
  cartItemId: number;
  productItemId: number;
  productVariantId: number;
  productName: string;
  /** 옵션 조합 텍스트 (예: "IVORY / M") */
  optionText: string;
  imageUrl: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  /** 라인 금액 (적용가 × 수량) */
  totalPrice: number;
  stockQuantity: number;
  isSoldOut: boolean;
  /** false 인 라인은 금액 합계에서 제외된다 */
  isAvailable: boolean;
}

export interface UserCartBrandGroup {
  brandId: number;
  brandName: string;
  brandProfileImage: string;
  items: UserCartItem[];
  /** 이 브랜드의 상품 금액 합 (구매 가능 라인만) */
  productAmount: number;
}

export interface GetUserCartRes {
  /** 브랜드별 묶음은 표시용이다. 배송비는 브랜드와 무관하게 주문 1건당 1회다 */
  brandGroups: UserCartBrandGroup[];
  /** 상품 금액 합 (구매 가능 라인만) */
  totalProductAmount: number;
  /** 배송지가 아직 없으므로 본섬 기준 예상값. 확정은 주문서에서 한다 */
  estimatedShippingFee: number;
  /** 외섬 배송비 (안내용) */
  remoteIslandFee: number;
  freeShippingThreshold: number;
  /** 무료배송까지 남은 금액. 0이면 이미 무료배송이다 */
  amountToFreeShipping: number;
  estimatedTotalAmount: number;
  totalCount: number;
}

/**
 * @description 장바구니 조회
 */
export const getUserCart = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("user/cart", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetUserCartRes>>();

export interface GetUserCartCountRes {
  count: number;
}

/**
 * @description 장바구니 라인 수 조회 (헤더 뱃지용)
 */
export const getUserCartCount = () =>
  api.get("user/cart/count").json<CommonRes<GetUserCartCountRes>>();

export interface UpdateUserCartItemReq {
  cartItemId: number;
  quantity: number;
}

/**
 * @description 장바구니 수량 변경
 */
export const updateUserCartItem = ({
  cartItemId,
  quantity,
}: UpdateUserCartItemReq) =>
  api
    .patch(`user/cart/${cartItemId}`, {
      json: { quantity },
    })
    .json<CommonRes<null>>();

/**
 * @description 장바구니 라인 삭제
 */
export const deleteUserCartItem = (cartItemId: number) =>
  api.delete(`user/cart/${cartItemId}`);

/**
 * @description 장바구니 선택 삭제 / 전체 비우기. ids 를 생략하면 전체를 비운다.
 */
export const deleteUserCartItems = (ids?: number[]) =>
  api.delete("user/cart", {
    // ids 는 반복 쿼리 파라미터라 객체가 아닌 쌍 배열로 넘긴다.
    searchParams: ids?.map<Array<string | number>>((id) => ["ids", id]),
  });
