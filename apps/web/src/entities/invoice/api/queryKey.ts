export const USER_INVOICE_QUERY_KEY = ["user", "invoice"] as const;

/** 확인 결과는 입력값에만 달려 있어 userId 없이 값으로 캐시한다 */
export const userInvoiceQueryKeys = {
  all: USER_INVOICE_QUERY_KEY,

  mobileBarcodeCheck: (code: string) =>
    [...USER_INVOICE_QUERY_KEY, "check", "mobile-barcode", code] as const,

  loveCodeCheck: (code: string) =>
    [...USER_INVOICE_QUERY_KEY, "check", "love-code", code] as const,

  companyCheck: (taxId: string) =>
    [...USER_INVOICE_QUERY_KEY, "check", "company", taxId] as const,
};
