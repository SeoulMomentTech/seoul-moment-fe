import { languageMap, type LanguageType } from "@/i18n/const";

import type { UserCartBrandGroup, UserCartItem } from "./userCart";

import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

// beforeRequest 훅은 GET 의 languageCode 쿼리만 Accept-language 로 옮긴다.
// 주문 API 는 POST 이면서 언어 헤더가 필수라 여기서 직접 채운다.
const acceptLanguageHeaders = (languageCode: LanguageType) => ({
  "Accept-language": languageMap[languageCode] ?? "ko",
});

export interface UserOrderDirectItem {
  /** 상품 변형(SKU) ID. 상품상세 v1 응답의 variants[].id */
  productVariantId: number;
  quantity: number;
}

/**
 * 주문 대상. 장바구니에서 주문하면 cartItemIds, 상품상세 "구매하기" 면 items 를 보낸다.
 * 스웨거의 "둘 중 정확히 하나" 규칙을 타입으로 강제한다. 미리보기와 주문 생성이 같은 규칙이라
 * 한 타입을 둘이 나눠 쓴다.
 */
export type UserOrderSourceBody =
  | { cartItemIds: number[]; items?: never }
  | { cartItemIds?: never; items: UserOrderDirectItem[] };

/** 배송비가 지역으로 정해진다. 생략하면 본섬 기준 예상값이라 둘 다 없거나 둘 다 있다 */
type UserOrderPreviewAddress =
  | { city: string; district: string }
  | { city?: never; district?: never };

export type PostUserOrderPreviewReq = PublicLanguageCode &
  UserOrderSourceBody &
  UserOrderPreviewAddress;

/** 미리보기 라인. items("구매하기")로 부르면 장바구니 라인이 아니라 cartItemId 가 null 이다 */
export interface UserOrderPreviewItem extends Omit<UserCartItem, "cartItemId"> {
  cartItemId: number | null;
}

export interface UserOrderPreviewBrandGroup
  extends Omit<UserCartBrandGroup, "items"> {
  items: UserOrderPreviewItem[];
}

export interface PostUserOrderPreviewRes {
  /** 브랜드별 묶음 (표시용) */
  brandGroups: UserOrderPreviewBrandGroup[];
  totalProductAmount: number;
  /** 배송비. isShippingEstimated 가 true 면 본섬 기준 예상값이다 */
  shippingFee: number;
  isRemoteIsland: boolean;
  /** city·district 를 생략하면 true 이고 본섬 기준으로 계산된다 */
  isShippingEstimated: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  totalAmount: number;
}

/**
 * @description 주문서 금액 미리보기 (장바구니 주문 · 상품상세 구매하기).
 * DB 를 변경하지 않으며, 주소를 바꾸면 다시 호출해야 한다.
 */
export const postUserOrderPreview = ({
  languageCode,
  ...data
}: PostUserOrderPreviewReq) =>
  api
    .post("user/order/preview", {
      json: data,
      headers: acceptLanguageHeaders(languageCode),
    })
    .json<CommonRes<PostUserOrderPreviewRes>>();

export type UserOrderPaymentMethod = "LINE_PAY" | "ECPAY";

export interface UserOrderShipping {
  recipientName: string;
  phone: string;
  postalCode: string;
  /** 縣市 */
  city: string;
  /** 區/鄉 */
  district: string;
  detailAddress: string;
  requestMessage?: string;
}

/**
 * 기본 배송지를 쓰면 shipping 을 못 보내고, 직접 입력하면 반드시 보내야 한다.
 * 스웨거의 "useDefaultShipping 이 false 일 때 필수" 규칙을 타입으로 강제한다.
 */
type UserOrderShippingOption =
  | { useDefaultShipping: true; shipping?: never }
  | { useDefaultShipping: false; shipping: UserOrderShipping };

export type CreateUserOrderReq = PublicLanguageCode &
  UserOrderSourceBody &
  UserOrderShippingOption & {
    paymentMethod: UserOrderPaymentMethod;
  };

export interface CreateUserOrderRes {
  orderId: number;
  /** 예: "SM-20260903-000481" */
  orderNumber: string;
  totalAmount: number;
}

/**
 * @description 주문 생성 (결제하기 직전). PENDING 으로 생성되며 재고 차감도 장바구니 비우기도 하지 않는다.
 */
export const createUserOrder = ({
  languageCode,
  ...data
}: CreateUserOrderReq) =>
  api
    .post("user/order", {
      json: data,
      headers: acceptLanguageHeaders(languageCode),
    })
    .json<CommonRes<CreateUserOrderRes>>();

export interface UserOrderItem {
  orderItemId: number;
  productItemId: number;
  brandId: number;
  /** 주문 시점 브랜드명 */
  brandName: string;
  /** 주문 시점 상품명 */
  productName: string;
  optionText: string;
  /** 주문 시점 이미지 URL */
  imageUrl: string;
  unitPrice: number;
  /** 적용가 */
  unitDiscountPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface GetUserOrderDetailRes {
  orderId: number;
  orderNumber: string;
  /** 예: "PENDING" */
  status: string;
  paymentMethod?: UserOrderPaymentMethod;
  totalProductAmount: number;
  /** 청구된 배송비 */
  shippingFee: number;
  isRemoteIsland: boolean;
  /** 주문 시점의 무료배송 임계금액 */
  freeShippingThreshold: number;
  totalAmount: number;
  orderedAt: string;
  items: UserOrderItem[];
  shipping: UserOrderShipping;
}

/**
 * @description 주문 상세 조회
 */
export const getUserOrderDetail = (orderId: number) =>
  api.get(`user/order/${orderId}`).json<CommonRes<GetUserOrderDetailRes>>();
