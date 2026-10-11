import { languageMap } from "@shared/lib/i18n/language";

import type { UserCartBrandGroup } from "./userCart";

import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

/**
 * 주문. 결제까지 가지는 못한다 — 이 API 에는 외부 결제창(LINE Pay·ECPay) URL 을 받는
 * 엔드포인트가 없다(스웨거 152개 경로 중 0개). `POST user/order` 는 주문을 만들기만 하고
 * 결제 수단으로 넘기는 길이 없어서, 부르면 낼 방법이 없는 주문만 쌓인다.
 * 그래서 앱도 web 과 같이 주문서까지만 그리고 생성은 부르지 않는다.
 */
export type UserOrderPaymentMethod = "LINE_PAY" | "ECPAY";

export interface UserOrderDirectItem {
  /** 상품 상세 v1 응답의 variants[].id. */
  productVariantId: number;
  quantity: number;
}

/**
 * 무엇을 주문하는지. 서버는 둘 중 **정확히 하나**를 요구한다 —
 * 장바구니에서 왔으면 cartItemIds, 상품 상세에서 바로 사면 items.
 */
export type UserOrderSourceBody =
  | { cartItemIds: number[]; items?: never }
  | { items: UserOrderDirectItem[]; cartItemIds?: never };

export type PostUserOrderPreviewReq = UserOrderSourceBody &
  PublicLanguageCode & {
    /** 배송지 縣市. 생략하면 본섬 기준 예상 배송비가 온다(isShippingEstimated=true). */
    city?: string;
    /** 배송지 區/鄉. 綠島鄉·蘭嶼鄉 은 臺東縣이지만 외섬이다. */
    district?: string;
  };

export interface PostUserOrderPreviewRes {
  /** 장바구니와 같은 모양이다. "구매하기"로 불러도 서버가 같은 틀로 돌려준다. */
  brandGroups: UserCartBrandGroup[];
  totalProductAmount: number;
  /** 배송지와 무료배송 판정이 반영된 배송비. isShippingEstimated 면 본섬 기준 예상값이다. */
  shippingFee: number;
  isRemoteIsland: boolean;
  /** city·district 를 생략하면 true. 그때 shippingFee 는 확정이 아니다. */
  isShippingEstimated: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  totalAmount: number;
}

/**
 * @description 주문서 금액 미리보기 (access_token 필요).
 *
 * POST 지만 아무것도 바꾸지 않는 조회라 쿼리로 다룬다. 주문서의 라인 목록과 금액을
 * **한 응답에서** 읽는 이유가 있다 — 목록은 장바구니에서, 금액은 여기서 읽으면 다른
 * 기기에서 수량을 바꾼 순간 둘이 갈라지고 어느 쪽이 옳은지 화면에서 알 수 없어진다.
 */
export const postUserOrderPreview = ({
  languageCode,
  ...body
}: PostUserOrderPreviewReq) =>
  api
    .post("user/order/preview", {
      json: body,
      // 헤더를 직접 세운다. services/index 의 beforeRequest 는 GET 의 languageCode 만
      // 헤더로 옮기므로, POST 에 그대로 두면 진짜 쿼리 파라미터로 나가 서버가 거절한다.
      headers: { "Accept-language": languageMap[languageCode] ?? "ko" },
    })
    .json<CommonRes<PostUserOrderPreviewRes>>();

export interface UserOrderShipping {
  recipientName: string;
  /** `+886` 을 포함한 정규형. */
  phone: string;
  postalCode: string;
  city: string;
  district: string;
  detailAddress: string;
  requestMessage?: string;
}
