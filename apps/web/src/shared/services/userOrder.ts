import { languageMap, type LanguageType } from "@/i18n/const";

import type { CvsStore } from "./logistics";
import type {
  UserCartBrandGroup,
  UserCartItem,
  UserInternationalDiscount,
} from "./userCart";

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

/** 배송 방법. HOME 택배 / CVS 편의점 픽업. 생략하면 HOME 이다 */
export type UserOrderShippingType = "HOME" | "CVS";

/**
 * 미리보기의 배송비 입력. 택배는 縣市·區 로, 편의점 픽업은 매장 토큰으로 지역을 정한다.
 * 어느 쪽이든 생략하면 본섬 기준 예상값(isShippingEstimated=true)이라 택배는 둘 다 없거나
 * 둘 다 있다. 離島 매장이면 외섬 요금이 붙는다.
 */
type UserOrderPreviewShipping =
  | ({ shippingType?: "HOME"; cvsStoreToken?: never } & (
      | { city: string; district: string }
      | { city?: never; district?: never }
    ))
  | {
      shippingType: "CVS";
      /** 전자지도에서 고른 매장의 cvsStoreToken. 생략하면 본섬 기준 예상 배송비다 */
      cvsStoreToken?: string;
      city?: never;
      district?: never;
    };

export type PostUserOrderPreviewReq = PublicLanguageCode &
  UserOrderSourceBody &
  UserOrderPreviewShipping;

/** 미리보기 라인. items("구매하기")로 부르면 장바구니 라인이 아니라 cartItemId 가 null 이다 */
export interface UserOrderPreviewItem extends Omit<UserCartItem, "cartItemId"> {
  cartItemId: number | null;
}

export interface UserOrderPreviewBrandGroup
  extends Omit<UserCartBrandGroup, "items"> {
  items: UserOrderPreviewItem[];
}

export interface PostUserOrderPreviewRes extends UserInternationalDiscount {
  /** 브랜드별 묶음 (표시용) */
  brandGroups: UserOrderPreviewBrandGroup[];
  totalProductAmount: number;
  /** 배송비. isShippingEstimated 가 true 면 본섬 기준 예상값이다 */
  shippingFee: number;
  isRemoteIsland: boolean;
  /** city·district(또는 cvsStoreToken)를 생략하면 true 이고 본섬 기준으로 계산된다 */
  isShippingEstimated: boolean;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  totalAmount: number;
}

/**
 * @description 주문서 금액 미리보기 (장바구니 주문 · 상품상세 구매하기).
 * DB 를 변경하지 않으며, 주소(또는 편의점 매장)를 바꾸면 다시 호출해야 한다.
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

export interface UserOrderCvsPickup {
  /** 전자지도에서 매장을 고른 뒤 받은 cvsStoreToken (GET logistics/cvs/map). 1시간 유효 */
  storeToken: string;
  /** 받는 분 실명 — 수령 시 신분증과 대조한다. 중문 2–5자 또는 영문 4–10자(공백·숫자 불가) */
  recipientName: string;
  /** 받는 분 휴대폰. 09 로 시작하는 10자리. 도착 문자가 간다 */
  phone: string;
}

/**
 * 배송 방법별 입력.
 * - HOME: 기본 배송지를 쓰면 shipping 을 못 보내고, 직접 입력하면 반드시 보내야 한다
 *   (스웨거의 "useDefaultShipping 이 false 일 때 필수").
 * - CVS: cvsPickup 이 필수이고 useDefaultShipping·shipping 은 보지 않는다.
 */
type UserOrderShippingOption =
  | {
      shippingType?: "HOME";
      useDefaultShipping: true;
      shipping?: never;
      cvsPickup?: never;
    }
  | {
      shippingType?: "HOME";
      useDefaultShipping: false;
      shipping: UserOrderShipping;
      cvsPickup?: never;
    }
  | {
      shippingType: "CVS";
      cvsPickup: UserOrderCvsPickup;
      useDefaultShipping?: never;
      shipping?: never;
    };

/**
 * 전자발표(電子發票) 받는 방법.
 * MEMBER_CARRIER ECPay 회원 載具(이메일) / MOBILE_BARCODE 휴대폰 바코드 /
 * CITIZEN_CERT 自然人憑證 / DONATION 기부 / COMPANY 회사(統一編號)
 */
export type UserOrderInvoiceType =
  | "MEMBER_CARRIER"
  | "MOBILE_BARCODE"
  | "CITIZEN_CERT"
  | "DONATION"
  | "COMPANY";

/** 발표 방법마다 필요한 값이 다르다. 소문자 carrierNum 은 서버가 대문자로 바꾼다 */
export type UserOrderInvoice =
  | { type: "MEMBER_CARRIER" }
  | {
      type: "MOBILE_BARCODE" | "CITIZEN_CERT";
      /** MOBILE_BARCODE: "/" + 7자(영문 대문자·숫자·+-.) / CITIZEN_CERT: 영문 대문자 2 + 숫자 14 */
      carrierNum: string;
    }
  | {
      type: "DONATION";
      /** 愛心碼 숫자 3–7자리. 없는 코드면 주문이 400 이라 먼저 확인한다 */
      loveCode: string;
    }
  | {
      type: "COMPANY";
      /** 統一編號 8자리 */
      companyTaxId: string;
      /** 회사명 (60자 이하) */
      companyName?: string;
    };

export type CreateUserOrderReq = PublicLanguageCode &
  UserOrderSourceBody &
  UserOrderShippingOption & {
    paymentMethod: UserOrderPaymentMethod;
    /** 생략하면 MEMBER_CARRIER(회원 이메일로 받음). 결제가 확정되면 서버가 발행한다 */
    invoice?: UserOrderInvoice;
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

/**
 * 주문 상태.
 * PENDING 결제 전(결제창 이탈 포함, 다시 결제 가능) / PAYMENT_WAITING ATM·편의점 입금 대기 /
 * PAID 결제 완료 / CANCELED 취소(입금 기한 경과·장기 미결제) /
 * FAILED 결제 후 재고 부족 등으로 환불 대상
 */
export type UserOrderStatus =
  | "PENDING"
  | "PAYMENT_WAITING"
  | "PAID"
  | "CANCELED"
  | "FAILED";

/**
 * 결제 시도 상태.
 * REQUESTED 결제 중 / WAITING_DEPOSIT 입금 대기 / PAID 완료 /
 * FAILED · CANCELED · EXPIRED 결제 안 됨(같은 주문으로 다시 결제 가능)
 */
export type UserPaymentStatus =
  | "READY"
  | "REQUESTED"
  | "WAITING_DEPOSIT"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "EXPIRED";

/** ATM 계좌 · 편의점 납부 코드. 입금 대기일 때만 있다 */
export interface UserPaymentDepositInfo {
  /** ECPay 결제수단. ATM_ 으로 시작하면 계좌이체, CVS_ 면 편의점 납부. 예: "ATM_LAND" */
  paymentType: string;
  /** ATM 은행 코드 */
  bankCode?: string;
  /** ATM 가상계좌 */
  account?: string;
  /** 편의점 납부 코드 */
  paymentNo?: string;
}

/** 결제 시도. 주문 상세의 가장 최근 시도와 결제 결과 조회가 공유한다 */
export interface UserOrderPayment {
  paymentId: number;
  method: UserOrderPaymentMethod;
  status: UserPaymentStatus;
  amount: number;
  /** PG 가 알려준 실제 결제수단 (Credit_CreditCard, ATM_LAND …) */
  pgPaymentType?: string | null;
  depositInfo?: UserPaymentDepositInfo | null;
  /** 입금 기한 (ATM · 편의점) */
  expireAt?: string | null;
  paidAt?: string | null;
  /** 실패 사유 코드 (PG 응답 코드) */
  failureCode?: string | null;
}

/** 발행 상태. PENDING 결제 전·발행 대기 / ISSUED 발행됨 / FAILED 발행 실패(서버가 다시 시도한다) */
export type UserOrderInvoiceStatus = "PENDING" | "ISSUED" | "FAILED";

export interface UserOrderInvoiceInfo {
  type: UserOrderInvoiceType;
  status: UserOrderInvoiceStatus;
  /** 휴대폰 바코드 · 自然人憑證 */
  carrierNum?: string | null;
  loveCode?: string | null;
  companyTaxId?: string | null;
  companyName?: string | null;
  /** 발표번호. 결제가 확정돼 발행되면 채워진다. 예: "LY74004967" */
  invoiceNo?: string | null;
  invoiceDate?: string | null;
  /** 랜덤 번호 4자리 */
  randomNumber?: string | null;
}

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

/**
 * 주문의 배송지. 편의점 픽업이면 주소 필드는 null 이고 cvsStore 에 매장이 온다
 * (스웨거 cvsStore 설명). shippingType 으로 좁힌다.
 */
export type UserOrderShippingInfo =
  | (UserOrderShipping & { shippingType: "HOME"; cvsStore?: null })
  | {
      shippingType: "CVS";
      recipientName: string;
      phone: string;
      postalCode: null;
      city: null;
      district: null;
      detailAddress: null;
      requestMessage?: null;
      cvsStore: CvsStore;
    };

/**
 * 배송 6단계. 결제·취소·환불 상태(status)와 독립이다.
 * INTERNATIONAL_SHIPPING 은 실제 국제운송이 시작된 때만이고, ARRIVED_TAIWAN 은 통관 완료와 다르다.
 */
export type UserOrderDeliveryStage =
  | "ORDER_CONFIRMED"
  | "PREPARING_ORDER"
  | "INTERNATIONAL_SHIPPING"
  | "ARRIVED_TAIWAN"
  | "LOCAL_DELIVERY"
  | "DELIVERED";

/** 환불 상태. REQUESTED·PROCESSING 진행 중 / COMPLETED 완료 / FAILED 처리 지연(고객센터 확인 중) */
export type UserOrderRefundStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

/** 가장 최근 환불 */
export interface UserOrderRefund {
  status: UserOrderRefundStatus;
  /** 이 환불의 금액 NT$. 결제 금액보다 작으면 부분 환불이다 */
  amount: number;
  /** 환불 접수 시각 */
  requestedAt: string;
  /** 환불 완료 시각. 카드 명세서 반영은 카드사에 따라 더 걸릴 수 있다 */
  completedAt?: string | null;
}

export interface GetUserOrderDetailRes {
  orderId: number;
  orderNumber: string;
  status: UserOrderStatus;
  paymentMethod?: UserOrderPaymentMethod;
  totalProductAmount: number;
  /** 청구된 배송비 */
  shippingFee: number;
  isRemoteIsland: boolean;
  /** 주문 시점의 무료배송 임계금액 */
  freeShippingThreshold: number;
  /** 국제배송비 지원 할인액 스냅샷(NT$). 없으면 0 */
  internationalDiscount: number;
  totalAmount: number;
  /** 주문 상태 문구 (Accept-language 로 번역) */
  statusLabel: string;
  deliveryStage: UserOrderDeliveryStage;
  /** 배송 단계 문구 */
  deliveryStageLabel: string;
  /** 진행바 위치 (1~6) */
  deliveryStep: number;
  orderedAt: string;
  paidAt?: string | null;
  /** 가장 최근 결제 시도. 결제를 시작하기 전이면 null */
  payment?: UserOrderPayment | null;
  /** 전자발표. 결제가 확정되면 서버가 발행해 invoiceNo 가 채워진다 */
  invoice?: UserOrderInvoiceInfo | null;
  items: UserOrderItem[];
  shipping: UserOrderShippingInfo;
  /** 실제 수령·배송 완료 시각. 배송 완료 전이면 null */
  deliveredAt?: string | null;
  /** 대만 국내운송사 */
  localCarrier?: string | null;
  /** 대만 국내운송장 번호 */
  localTrackingNo?: string | null;
  /**
   * 취소·계약해제 신청 버튼을 보여도 되는지. 결제 완료 주문이면 발주·해외배송·수령 뒤에도
   * true 다. 이미 접수했으면 false
   */
  canRequestCancel: boolean;
  /**
   * 24시간 간편취소 구간인지(서버 시각 기준). 안내 문구만 바꾸는 값이다 — false 여도
   * canRequestCancel 이 true 면 신청 경로를 숨기지 않는다
   */
  isQuickCancelPeriod: boolean;
  /** 간편취소 구간이 끝나는 시각 (결제 완료 + 24시간) */
  quickCancelUntil?: string | null;
  /** 취소·계약해제를 접수한 시각. 접수 전이면 null */
  cancellationRequestedAt?: string | null;
  /**
   * 가장 최근 환불. 시작되지 않았으면 null. 결제 후 24시간 안 · 발주 전에 취소를 신청하면
   * 신청 직후에 생긴다(자동 환불). 전액 환불이면 status 가 CANCELED, 부분 환불이면 PAID 그대로다
   */
  refund?: UserOrderRefund | null;
  /** 지금까지 환불이 완료된 합계 NT$. 부분 환불이 여러 번이면 더한 값. 없으면 0 */
  refundedAmount: number;
}

export interface GetUserOrderDetailReq extends PublicLanguageCode {
  orderId: number;
}

/**
 * @description 주문 상세 조회. 언어는 statusLabel · deliveryStageLabel 문구에 쓰인다.
 */
export const getUserOrderDetail = ({
  orderId,
  languageCode,
}: GetUserOrderDetailReq) =>
  api
    .get(`user/order/${orderId}`, {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetUserOrderDetailRes>>();

/**
 * 주문 목록 필터. ALL 전체 / IN_PROGRESS 입금 대기·배송 전~배송 중 /
 * COMPLETED 배송 완료 / CANCELED 취소·환불 대상
 */
export type UserOrderListStatusFilter =
  | "ALL"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

export interface GetUserOrderListReq extends PublicLanguageCode {
  /** 기본 ALL. 결제 전(PENDING) 주문은 어느 필터에도 나오지 않는다 */
  status?: UserOrderListStatusFilter;
  /** 최근 N개월만. 생략하면 전체 기간 */
  months?: number;
  /** 기본 1 */
  page?: number;
  /** 페이지 크기. 기본 10, 최대 50 */
  count?: number;
}

export interface UserOrderListItem {
  orderId: number;
  orderNumber: string;
  orderedAt: string;
  paidAt?: string | null;
  /** 결제 전(PENDING) 주문은 목록에 나오지 않는다 */
  status: Exclude<UserOrderStatus, "PENDING">;
  /** 주문 상태 문구 (Accept-language 로 번역) */
  statusLabel: string;
  /** 취소·환불은 이 값에 섞지 않고 status 로 본다 */
  deliveryStage: UserOrderDeliveryStage;
  /** 배송 단계 문구 */
  deliveryStageLabel: string;
  /** 진행바 위치 (1~6) */
  deliveryStep: number;
  /** 최종 결제 금액 NT$ */
  totalAmount: number;
  /** 국제배송비 지원 할인액 NT$ */
  internationalDiscount: number;
  representativeProductName?: string | null;
  representativeImageUrl?: string | null;
  representativeOptionText?: string | null;
  /** 주문 상품 라인 수 ("외 N건" 계산용) */
  itemCount: number;
  /** 취소·계약해제가 접수된 주문인지. 배송 진행바에 섞지 않고 배지로 보여준다 */
  cancellationRequested: boolean;
}

export interface GetUserOrderListRes {
  total: number;
  list: UserOrderListItem[];
}

/**
 * @description 내 주문 목록 (주문조회). 최신 주문부터 내려오며 결제 전(PENDING) 주문은 빠진다.
 */
export const getUserOrderList = ({
  status,
  months,
  page,
  count,
  languageCode,
}: GetUserOrderListReq) =>
  api
    .get("user/order", {
      searchParams: {
        status,
        months,
        page,
        count,
        languageCode,
      },
    })
    .json<CommonRes<GetUserOrderListRes>>();

export interface PostUserOrderPaymentReq extends PublicLanguageCode {
  orderId: number;
}

export interface PostUserOrderPaymentRes {
  paymentId: number;
  method: UserOrderPaymentMethod;
  /**
   * ECPAY — 이 URL 로 브라우저를 보낸다. LINE 안이면 외부 브라우저로 연다
   * (LIFF: liff.openWindow({ url, external: true }), 그 밖 LINE 인앱: ?openExternalBrowser=1).
   * 30분 안에 한 번만 열 수 있다
   */
  handoffUrl?: string | null;
  /**
   * LINE_PAY — 결제 페이지(웹). LINE 밖에서 연다(데스크톱·휴대폰 브라우저). Slack 같은 다른 앱의
   * 인앱 브라우저에서는 "LINE 앱 업데이트" 화면에 막힌다. 약 20분 유효
   */
  paymentUrl?: string | null;
  /** LINE_PAY — LINE 안에서 여는 결제 페이지(`line://`). 외부 브라우저로 넘기지 않는다 */
  appUrl?: string | null;
  /** 로그인 없이 결제 결과를 보는 토큰. 결제 후 결과 페이지(?h=)로 넘어오는 값과 같다 */
  resultToken: string;
}

/**
 * @description 결제 시작 (주문 생성 직후 · 결제창 이탈 후 다시 결제).
 *
 * 주문(PENDING)의 결제수단으로 결제를 시작하며 이때 재고를 잡는다 — 모자라면 409
 * (data.productVariantIds)이고 PG 로 넘어가지 않는다. 진행 중인 이전 시도가 있으면 취소로
 * 닫고 새로 만든다. 결제가 끝나면 브라우저는 `{STOREFRONT}/payment/result?h={resultToken}`
 * 으로 돌아온다. Accept-language 는 ECPay 결제창 언어다.
 */
export const postUserOrderPayment = ({
  orderId,
  languageCode,
}: PostUserOrderPaymentReq) =>
  api
    .post(`user/order/${orderId}/payment`, {
      headers: acceptLanguageHeaders(languageCode),
    })
    .json<CommonRes<PostUserOrderPaymentRes>>();

export interface PostUserOrderCancelRequestReq extends PublicLanguageCode {
  orderId: number;
  /** 취소·계약해제 사유 (선택, 500자). 없어도 접수된다 */
  reason?: string;
}

/**
 * @description 취소·계약해제 신청 (통지 접수). 결제 완료(PAID) 주문이면 발주·배송·수령과 무관하게
 * 접수되고 한국 발주를 막는다. 결제 후 24시간 안 · 발주 전이면 자동 환불도 시작하지만 응답은
 * 그대로 204 라 주문 상세를 다시 불러 refund 를 본다. 이미 접수된 주문에 다시 보내도 204.
 * 409 는 결제 완료 주문이 아님(결제 전·입금 대기·취소·실패).
 */
export const postUserOrderCancelRequest = async ({
  orderId,
  reason,
  languageCode,
}: PostUserOrderCancelRequestReq) => {
  await api.post(`user/order/${orderId}/cancel-request`, {
    headers: acceptLanguageHeaders(languageCode),
    json: reason ? { reason } : {},
  });
};
