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
