import type { AdminOrderId } from "@shared/services/order";

export const ORDER_QUERY_KEY = ["admin", "order"] as const;

export const orderQueryKeys = {
  all: ORDER_QUERY_KEY,
  list: (params?: unknown) => [...ORDER_QUERY_KEY, "list", params] as const,
  summary: () => [...ORDER_QUERY_KEY, "summary"] as const,
  detail: (orderId: AdminOrderId) =>
    [...ORDER_QUERY_KEY, "detail", orderId] as const,
};
