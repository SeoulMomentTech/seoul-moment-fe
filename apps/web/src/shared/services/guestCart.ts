import type {
  GetUserCartRes,
  UserCartBrandGroup,
  UserCartItem,
} from "./userCart";

import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

/**
 * 게스트 장바구니의 주인을 가리키는 헤더.
 *
 * 회원 장바구니에서 `Authorization` 이 하던 일을 이 헤더가 대신한다. 값은 **첫 담기 응답으로
 * 발급**되므로, 클라이언트가 보관했다가 이후 요청마다 실어 보낸다.
 */
const GUEST_ID_HEADER = "x-guest-id";

const guestHeaders = (guestId: string) => ({ [GUEST_ID_HEADER]: guestId });

/** 게스트 ID 를 가진 요청. 담기와 라인 수 조회만 이 값 없이 부를 수 있다 */
export interface GuestCartReq {
  guestId: string;
}

export interface CreateGuestCartItem {
  /** 상품 변형(SKU) ID. 상품 상세 v1 응답의 variants[].id */
  productVariantId: number;
  quantity: number;
}

export interface CreateGuestCartItemsReq {
  /**
   * 담을 SKU 목록. 한 개만 담을 때도 길이 1 배열로 보낸다.
   * 같은 SKU 가 두 번 들어오면 서버가 수량을 합쳐서 처리한다.
   */
  items: CreateGuestCartItem[];
  /** 가진 게스트 ID. 처음 담을 때는 비운다 — 서버가 새로 발급해 응답에 담아준다 */
  guestId?: string;
}

export interface CreatedGuestCartItem {
  productVariantId: number;
  /** 합산된 뒤의 라인 수량. 이미 담겨 있던 수량이 더해진 값이다 */
  quantity: number;
}

export interface CreateGuestCartItemsRes {
  /** 이 장바구니를 가리키는 게스트 ID. 새로 발급됐을 수 있으므로 응답마다 저장한다 */
  guestId: string;
  /** 담긴 라인. 요청한 순서를 그대로 지킨다 */
  items: CreatedGuestCartItem[];
  /** 담긴 뒤의 장바구니 라인 수. 헤더 뱃지를 바로 갱신하라고 함께 준다 */
  totalCount: number;
}

/**
 * @description 게스트 장바구니 담기 (단건 · 다건). 이미 담긴 SKU 면 라인을 늘리지 않고
 * 수량을 더한다. 하나라도 담을 수 없으면 전부 담지 않는다 — 재고가 모자라면 409 가 온다.
 */
export const createGuestCartItems = ({
  guestId,
  ...data
}: CreateGuestCartItemsReq) =>
  api
    .post("guest/cart", {
      json: data,
      headers: guestId ? guestHeaders(guestId) : undefined,
    })
    .json<CommonRes<CreateGuestCartItemsRes>>();

/**
 * 게스트 장바구니 라인.
 *
 * 회원 라인과 같은 모양이지만 **라인 ID 가 없다**. 수량 변경·삭제는 `productVariantId` 로 한다.
 */
export interface GuestCartItem extends Omit<UserCartItem, "cartItemId"> {
  cartItemId: null;
}

export interface GuestCartBrandGroup extends Omit<UserCartBrandGroup, "items"> {
  items: GuestCartItem[];
}

/** 회원 장바구니 조회와 같은 응답 모양이라 화면 컴포넌트를 그대로 쓴다 */
export interface GetGuestCartRes extends Omit<GetUserCartRes, "brandGroups"> {
  brandGroups: GuestCartBrandGroup[];
}

/**
 * @description 게스트 장바구니 조회
 */
export const getGuestCart = ({
  guestId,
  languageCode,
}: GuestCartReq & PublicLanguageCode) =>
  api
    .get("guest/cart", {
      searchParams: {
        languageCode,
      },
      headers: guestHeaders(guestId),
    })
    .json<CommonRes<GetGuestCartRes>>();

export interface GetGuestCartCountRes {
  count: number;
}

/**
 * @description 게스트 장바구니 라인 수 조회 (헤더 뱃지용).
 * 게스트 ID 가 없거나 담은 적이 없으면 404 가 아니라 0 이다.
 */
export const getGuestCartCount = (guestId?: string) =>
  api
    .get("guest/cart/count", {
      headers: guestId ? guestHeaders(guestId) : undefined,
    })
    .json<CommonRes<GetGuestCartCountRes>>();

export interface UpdateGuestCartItemReq extends GuestCartReq {
  /** 경로 파라미터는 라인 ID 가 아니라 SKU ID 다 */
  productVariantId: number;
  quantity: number;
}

/**
 * @description 게스트 장바구니 수량 변경. 재고를 넘으면 409 다
 */
export const updateGuestCartItem = ({
  guestId,
  productVariantId,
  quantity,
}: UpdateGuestCartItemReq) =>
  api
    .patch(`guest/cart/${productVariantId}`, {
      json: { quantity },
      headers: guestHeaders(guestId),
    })
    .json<CommonRes<null>>();

export interface DeleteGuestCartItemReq extends GuestCartReq {
  productVariantId: number;
}

/**
 * @description 게스트 장바구니 라인 삭제
 */
export const deleteGuestCartItem = ({
  guestId,
  productVariantId,
}: DeleteGuestCartItemReq) =>
  api.delete(`guest/cart/${productVariantId}`, {
    headers: guestHeaders(guestId),
  });

/**
 * @description 게스트 장바구니 비우기. 회원 쪽과 달리 **선택 삭제가 없어** 언제나 전체다.
 * 담은 적이 없어도 204 다.
 */
export const deleteGuestCart = (guestId: string) =>
  api.delete("guest/cart", {
    headers: guestHeaders(guestId),
  });
