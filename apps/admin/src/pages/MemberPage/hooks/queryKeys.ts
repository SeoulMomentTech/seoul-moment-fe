import type { AdminMemberId } from "@shared/services/member";

export const MEMBER_QUERY_KEY = ["admin", "member"] as const;

export const memberQueryKeys = {
  all: MEMBER_QUERY_KEY,
  list: (params?: unknown) => [...MEMBER_QUERY_KEY, "list", params] as const,
  summary: () => [...MEMBER_QUERY_KEY, "summary"] as const,
  detail: (memberId: AdminMemberId) =>
    [...MEMBER_QUERY_KEY, "detail", memberId] as const,
  orders: (memberId: AdminMemberId, params?: unknown) =>
    [...MEMBER_QUERY_KEY, "detail", memberId, "order", params] as const,
  cart: (memberId: AdminMemberId) =>
    [...MEMBER_QUERY_KEY, "detail", memberId, "cart"] as const,
  likes: (memberId: AdminMemberId, params?: unknown) =>
    [...MEMBER_QUERY_KEY, "detail", memberId, "like", params] as const,
  recent: (memberId: AdminMemberId, params?: unknown) =>
    [...MEMBER_QUERY_KEY, "detail", memberId, "recent", params] as const,
};
