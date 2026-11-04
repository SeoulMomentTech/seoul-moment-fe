export const PAYMENT_QUERY_KEY = ["payment"] as const;

/** 결제 결과는 로그인 없이 토큰으로 보므로 userId 대신 토큰이 키다 */
export const paymentQueryKeys = {
  all: PAYMENT_QUERY_KEY,

  result: (token: string | null) =>
    [...PAYMENT_QUERY_KEY, "result", token] as const,
};
