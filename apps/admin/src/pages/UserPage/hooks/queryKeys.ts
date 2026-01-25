export const USER_QUERY_KEY = ["admin", "user"] as const;

export const userQueryKeys = {
  all: USER_QUERY_KEY,
  list: (params?: unknown) => [...USER_QUERY_KEY, "list", params] as const,
};
