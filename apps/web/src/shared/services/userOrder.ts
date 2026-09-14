import { languageMap, type LanguageType } from "@/i18n/const";

import type { UserCartBrandGroup } from "./userCart";

import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

// beforeRequest 훅은 GET 의 languageCode 쿼리만 Accept-language 로 옮긴다.
// 주문 API 는 POST 이면서 언어 헤더가 필수라 여기서 직접 채운다.
const acceptLanguageHeaders = (languageCode: LanguageType) => ({
  "Accept-language": languageMap[languageCode] ?? "ko",
});

export interface PostUserOrderPreviewReq extends PublicLanguageCode {
  cartItemIds: number[];
  /** 배송지 縣市. 배송비가 지역으로 정해지므로 필수다 */
  city: string;
  /** 배송지 區/鄉. 綠島鄉·蘭嶼鄉 은 臺東縣이지만 외섬이다 */
  district: string;
}

export interface PostUserOrderPreviewRes {
  brandGroups: UserCartBrandGroup[];
  totalProductAmount: number;
  /** 확정 배송비. 배송지 지역과 무료배송 판정이 모두 반영된 값 */
  shippingFee: number;
  isRemoteIsland: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  totalAmount: number;
}

/**
 * @description 주문서 금액 미리보기. DB 를 변경하지 않으며, 주소를 바꾸면 다시 호출해야 한다.
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
  UserOrderShippingOption & {
    cartItemIds: number[];
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
