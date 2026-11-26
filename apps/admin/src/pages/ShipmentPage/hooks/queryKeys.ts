export const SHIPMENT_QUERY_KEY = ["admin", "shipment"] as const;

export const shipmentQueryKeys = {
  all: SHIPMENT_QUERY_KEY,
  list: (params?: unknown) => [...SHIPMENT_QUERY_KEY, "list", params] as const,
};
