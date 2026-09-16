import { PATH } from "@shared/constants/route";
import type {
  AdminMemberLikeType,
  AdminMemberOrderStatus,
  AdminMemberPaymentMethod,
  AdminMemberProvider,
  AdminMemberStatus,
} from "@shared/services/member";

export const MEMBER_PROVIDER_LABEL: Record<AdminMemberProvider, string> = {
  EMAIL: "이메일",
  GOOGLE: "Google",
  LINE: "LINE",
};

/** 목록·현황에서 항상 같은 순서로 노출한다 */
export const MEMBER_PROVIDERS: AdminMemberProvider[] = [
  "EMAIL",
  "GOOGLE",
  "LINE",
];

/**
 * 가입 경로는 실제 서비스 브랜드 색을 쓴다. 임의 색을 돌려 쓰면
 * 배지를 매번 읽어야 하지만, LINE 초록·Google 파랑은 훑기만 해도 구분된다.
 */
export const MEMBER_PROVIDER_BADGE_CLASS: Record<AdminMemberProvider, string> =
  {
    EMAIL: "bg-gray-100 text-gray-700",
    GOOGLE: "bg-blue-50 text-blue-700",
    LINE: "bg-green-50 text-green-700",
  };

export const MEMBER_PROVIDER_BAR_CLASS: Record<AdminMemberProvider, string> = {
  EMAIL: "bg-gray-400",
  GOOGLE: "bg-blue-500",
  LINE: "bg-green-500",
};

export const MEMBER_STATUS_LABEL: Record<AdminMemberStatus, string> = {
  ACTIVE: "활성 회원",
  WITHDRAWN: "탈퇴 회원",
};

export const MEMBER_ORDER_STATUS_LABEL: Record<AdminMemberOrderStatus, string> =
  {
    PENDING: "주문 대기",
    PAYMENT_WAITING: "입금 대기",
    PAID: "결제 완료",
    CANCELED: "주문 취소",
    FAILED: "결제 실패",
  };

export const MEMBER_ORDER_STATUS_BADGE_CLASS: Record<
  AdminMemberOrderStatus,
  string
> = {
  PENDING: "bg-gray-100 text-gray-700",
  PAYMENT_WAITING: "bg-amber-50 text-amber-700",
  PAID: "bg-green-50 text-green-700",
  CANCELED: "bg-gray-100 text-gray-500",
  FAILED: "bg-red-50 text-red-700",
};

export const MEMBER_ORDER_STATUSES: AdminMemberOrderStatus[] = [
  "PENDING",
  "PAYMENT_WAITING",
  "PAID",
  "CANCELED",
  "FAILED",
];

export const MEMBER_PAYMENT_METHOD_LABEL: Record<
  AdminMemberPaymentMethod,
  string
> = {
  LINE_PAY: "LINE Pay",
  ECPAY: "ECPay",
};

export const MEMBER_LIKE_TYPE_LABEL: Record<AdminMemberLikeType, string> = {
  PRODUCT: "상품",
  BRAND: "브랜드",
};

export const MEMBER_GENDER_LABEL: Record<"MALE" | "FEMALE" | "OTHER", string> =
  {
    MALE: "남성",
    FEMALE: "여성",
    OTHER: "기타",
  };

/** 상세 활동 탭에서 쓰는 페이지 크기. 목록 페이지와 별개로 고정한다 */
export const MEMBER_ACTIVITY_PAGE_SIZE = 10;

/** `/members/:memberId` 를 실제 경로로 채운다 */
export const getMemberDetailPath = (memberId: number) =>
  PATH.MEMBER_DETAIL.replace(":memberId", String(memberId));
