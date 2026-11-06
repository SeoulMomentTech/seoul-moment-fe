export const LOGISTICS_QUERY_KEY = ["logistics"] as const;

export const logisticsQueryKeys = {
  all: LOGISTICS_QUERY_KEY,

  cvsStore: (token: string | null) =>
    [...LOGISTICS_QUERY_KEY, "cvs", "store", token] as const,
};
