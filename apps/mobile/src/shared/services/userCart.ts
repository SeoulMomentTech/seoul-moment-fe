import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

/**
 * 장바구니. web 의 userCart 와 같은 응답이지만 "담기"(POST user/cart)는 적지 않는다 —
 * 앱에는 담는 자리가 없다(상품 상세는 읽기 전용). 여기 보이는 줄은 같은 계정으로
 * web 에서 담은 것들이다. 게스트 장바구니(guest/cart)도 쓰지 않는다 — 앱은 로그인한
 * 사람의 장바구니만 다룬다.
 *
 * languageCode 는 반드시 searchParams 로 넘긴다 — beforeRequest 가 그 값을
 * Accept-language 헤더로 옮기고 쿼리에서 지운다. 진짜 쿼리 파라미터로 보내면 서버가 400 을 준다.
 */
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
  /** 라인 개수다 — 수량의 합이 아니다 */
  totalCount: number;
}

/**
 * @description 장바구니 조회 (access_token 필요)
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
 * @description 장바구니 라인 수 조회 (헤더 뱃지용). 언어와 무관한 숫자 하나뿐이라
 * languageCode 를 받지 않는다 — 쿼리 키에도 언어가 들어가지 않는 이유다.
 */
export const getUserCartCount = () =>
  api.get("user/cart/count").json<CommonRes<GetUserCartCountRes>>();

export interface UpdateUserCartItemReq {
  cartItemId: number;
  quantity: number;
}

/**
 * @description 장바구니 수량 변경. 재고보다 많이 요청하면 409 가 온다.
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
 * @description 장바구니 라인 삭제. 본문 없이 204 만 오므로 .json() 을 부르지 않는다.
 */
export const deleteUserCartItem = (cartItemId: number) =>
  api.delete(`user/cart/${cartItemId}`);

/**
 * @description 장바구니 선택 삭제 / 전체 비우기. ids 를 생략하면 전체를 비운다.
 *
 * 아직 이 함수를 쓰는 화면은 없다 — 앱의 장바구니에는 고르는 축이 없어서 "선택 삭제"가
 * 뜻을 갖지 못하고, 담는 자리가 없는 앱에서 "전체 비우기"는 되돌릴 방법이 없는 버튼이다.
 * web 과 같은 API 면을 유지하려고 남겨 둔다.
 */
export const deleteUserCartItems = (ids?: number[]) =>
  api.delete("user/cart", {
    // ids 는 반복 쿼리 파라미터라 객체가 아닌 쌍 배열로 넘긴다.
    searchParams: ids?.map<(string | number)[]>((id) => ["ids", id]),
  });
