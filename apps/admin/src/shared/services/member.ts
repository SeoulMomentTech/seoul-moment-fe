import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminMemberId = Branded<number, "AdminMemberId">;

/** 가입 경로. EMAIL 은 SNS 연동이 없는 회원 */
export type AdminMemberProvider = "EMAIL" | "GOOGLE" | "LINE";

/** 회원 상태. WITHDRAWN 을 보낼 때만 탈퇴 회원을 조회한다 */
export type AdminMemberStatus = "ACTIVE" | "WITHDRAWN";

export interface AdminMemberListItem {
  id: AdminMemberId;
  /** 이메일. 탈퇴 회원은 익명값이다 */
  email: string;
  nickname: string;
  /** 이름 (프로필) */
  name: string | null;
  phone: string | null;
  provider: AdminMemberProvider;
  /** 전체 주문 건수 (취소·실패 포함) */
  orderCount: number;
  /** 결제 완료(PAID) 주문의 결제 금액 합 */
  paidAmount: number;
  /** 마지막 주문 일시. 주문이 없으면 null */
  lastOrderDate: string | null;
  /** 가입일 */
  createDate: string;
  /** 탈퇴 일시. 활성 회원은 null */
  withdrawnAt: string | null;
}

export interface GetAdminMemberListParams {
  page?: number;
  count?: number;
  /** 이메일·닉네임·이름·전화번호를 함께 검색한다 */
  search?: string;
  sort?: SortDirection;
  provider?: AdminMemberProvider;
  /** 기본값 ACTIVE */
  status?: AdminMemberStatus;
  /** 가입일 시작 (YYYY-MM-DD, UTC 기준 00:00:00 포함) */
  joinedFrom?: string;
  /** 가입일 종료 (YYYY-MM-DD, UTC 기준 23:59:59 포함) */
  joinedTo?: string;
  /** 광고·이벤트 수신 동의 여부 */
  adAgreed?: boolean;
}

export interface GetAdminMemberListResponse {
  total: number;
  list: AdminMemberListItem[];
}

/** 가입 경로별 활성 회원 수 */
export type AdminMemberProviderCount = Record<AdminMemberProvider, number>;

export interface GetAdminMemberSummaryResponse {
  /** 전체 활성 회원 수 */
  total: number;
  /** 최근 7일 신규 가입 수 */
  newIn7Days: number;
  /** 누적 탈퇴 회원 수 */
  withdrawn: number;
  byProvider: AdminMemberProviderCount;
}

/**
 * @description 회원 목록 조회 (`/admin/user` 는 관리자 계정이라 다른 API 다)
 * Swagger: AdminMemberController_getMemberList
 */
export const getAdminMemberList = (params?: GetAdminMemberListParams) =>
  fetcher.get<ApiResponse<GetAdminMemberListResponse>>("/admin/member", {
    params,
  });

/**
 * @description 회원 요약 조회. 목록 필터와 무관하게 항상 전체 기준으로 집계한다
 * Swagger: AdminMemberController_getMemberSummary
 */
export const getAdminMemberSummary = () =>
  fetcher.get<ApiResponse<GetAdminMemberSummaryResponse>>(
    "/admin/member/summary",
  );

/** 주문 상태 */
export type AdminMemberOrderStatus =
  | "PENDING"
  | "PAYMENT_WAITING"
  | "PAID"
  | "CANCELED"
  | "FAILED";

/** 결제 수단 */
export type AdminMemberPaymentMethod = "LINE_PAY" | "ECPAY";

/** 좋아요 대상 종류 */
export type AdminMemberLikeType = "PRODUCT" | "BRAND";

export interface AdminMemberSns {
  provider: AdminMemberProvider;
  /** SNS 계정 이메일. 제공하지 않는 경우 null */
  providerEmail: string | null;
}

export interface AdminMemberProfile {
  name: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  /** 생년월일 (YYYY-MM-DD) */
  birthDate: string | null;
  postalCode: string | null;
  city: string | null;
  district: string | null;
  detailAddress: string | null;
  imageUrl: string | null;
}

export interface AdminMemberFit {
  /** 키 (cm) */
  height: number | null;
  /** 몸무게 (kg) */
  weight: number | null;
  /** 신발 사이즈 (mm 단위 정수) */
  shoeSize: number | null;
  outerSize: string | null;
  topSize: string | null;
  bottomSize: string | null;
}

export interface AdminMemberAgreement {
  /** 이용약관 동의 일시 (변경 불가) */
  termsOfServiceAgreeDate: string;
  /** 개인정보 수집·이용 동의 일시 (변경 불가) */
  privacyPolicyAgreeDate: string;
  /** 신상품·기획전 알림 동의 일시. 미동의면 null */
  newProductDate: string | null;
  /** 광고·이벤트 이메일 동의 일시. 미동의면 null */
  adAgreeDate: string | null;
  /** 맞춤 추천 동의 일시. 미동의면 null */
  recommendDate: string | null;
}

export interface GetAdminMemberResponse {
  id: AdminMemberId;
  email: string;
  nickname: string;
  phone: string | null;
  createDate: string;
  /** 탈퇴 일시. 활성 회원은 null */
  withdrawnAt: string | null;
  /** SNS 연동. 이메일 가입이거나 탈퇴 회원이면 null */
  sns: AdminMemberSns | null;
  /** 프로필. 미작성이면 null */
  profile: AdminMemberProfile | null;
  /** 체형 정보. 미작성이면 null */
  fit: AdminMemberFit | null;
  agreement: AdminMemberAgreement;
}

export interface AdminMemberOrderListItem {
  id: number;
  orderNumber: string | null;
  status: AdminMemberOrderStatus;
  totalProductAmount: number;
  /** 실제 청구한 배송비 */
  shippingFeeApplied: number;
  totalAmount: number;
  /** 결제 수단. 미선택이면 null */
  paymentMethod: AdminMemberPaymentMethod | null;
  /** 주문 라인 수 */
  itemCount: number;
  createDate: string;
}

export interface AdminMemberCartItem {
  id: number;
  /** 상품 변형(SKU) ID */
  productVariantId: number;
  quantity: number;
  /** 상품명. 상품이 지워졌으면 null */
  productName: string | null;
  optionText: string;
  /** 적용가 (할인가 우선) */
  price: number;
  /** false 면 담긴 뒤 상품이 내려간 것이다 */
  isAvailable: boolean;
  createDate: string;
}

export interface AdminMemberLikeItem {
  type: AdminMemberLikeType;
  /** PRODUCT 면 product_item.id, BRAND 면 brand.id */
  targetId: number;
  /** 표시명. 다국어 텍스트가 없으면 null */
  name: string | null;
  /** 대표 이미지 URL. BRAND 는 항상 null */
  imageUrl: string | null;
  createDate: string;
}

export interface AdminMemberRecentItem {
  productItemId: number;
  name: string | null;
  imageUrl: string | null;
  /** 마지막으로 본 일시 */
  updateDate: string;
}

export interface AdminMemberPagingParams {
  page?: number;
  count?: number;
  sort?: SortDirection;
}

export interface GetAdminMemberOrderListParams extends AdminMemberPagingParams {
  status?: AdminMemberOrderStatus;
}

export interface GetAdminMemberLikeListParams extends AdminMemberPagingParams {
  /** 생략하면 상품·브랜드를 섞어 최신순으로 내린다 */
  type?: AdminMemberLikeType;
}

interface PagedResponse<T> {
  total: number;
  list: T[];
}

export type GetAdminMemberOrderListResponse =
  PagedResponse<AdminMemberOrderListItem>;
export type GetAdminMemberCartResponse = PagedResponse<AdminMemberCartItem>;
export type GetAdminMemberLikeListResponse = PagedResponse<AdminMemberLikeItem>;
export type GetAdminMemberRecentListResponse =
  PagedResponse<AdminMemberRecentItem>;

/**
 * @description 회원 상세 조회. 계정·SNS 연동·프로필·체형·동의를 한 번에 내린다.
 * 각 블록은 없으면 null 이고, 탈퇴 회원도 조회된다
 * Swagger: AdminMemberController_getMember
 */
export const getAdminMember = (userId: AdminMemberId) =>
  fetcher.get<ApiResponse<GetAdminMemberResponse>>(`/admin/member/${userId}`);

/**
 * @description 회원 주문 내역. 취소·실패 주문도 함께 내리며 금액은 주문 시점 스냅샷이다
 * Swagger: AdminMemberController_getMemberOrderList
 */
export const getAdminMemberOrderList = (
  userId: AdminMemberId,
  params?: GetAdminMemberOrderListParams,
) =>
  fetcher.get<ApiResponse<GetAdminMemberOrderListResponse>>(
    `/admin/member/${userId}/order`,
    { params },
  );

/**
 * @description 회원 장바구니. 페이징 없이 전부 내린다
 * Swagger: AdminMemberController_getMemberCart
 */
export const getAdminMemberCart = (userId: AdminMemberId) =>
  fetcher.get<ApiResponse<GetAdminMemberCartResponse>>(
    `/admin/member/${userId}/cart`,
  );

/**
 * @description 회원 좋아요 (상품·브랜드)
 * Swagger: AdminMemberController_getMemberLikeList
 */
export const getAdminMemberLikeList = (
  userId: AdminMemberId,
  params?: GetAdminMemberLikeListParams,
) =>
  fetcher.get<ApiResponse<GetAdminMemberLikeListResponse>>(
    `/admin/member/${userId}/like`,
    { params },
  );

/**
 * @description 회원 최근 본 상품. 보관 개수가 제한돼 있어 "평생 본 목록"이 아니다
 * Swagger: AdminMemberController_getMemberRecentList
 */
export const getAdminMemberRecentList = (
  userId: AdminMemberId,
  params?: AdminMemberPagingParams,
) =>
  fetcher.get<ApiResponse<GetAdminMemberRecentListResponse>>(
    `/admin/member/${userId}/recent`,
    { params },
  );
