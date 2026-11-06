import {
  getUserInvoiceCompanyCheck,
  getUserInvoiceLoveCodeCheck,
  getUserInvoiceMobileBarcodeCheck,
  type GetUserInvoiceCheckRes,
} from "@shared/services/userInvoice";

import type { QueryClient } from "@tanstack/react-query";

import { userInvoiceQueryKeys } from "./queryKey";

/** 서버 확인 API 가 있는 발표 타입 */
export type UserInvoiceCheckType = "MOBILE_BARCODE" | "DONATION" | "COMPANY";

const CHECK_STALE_MS = 1000 * 60 * 60;

const CHECKS: Record<
  UserInvoiceCheckType,
  {
    key(value: string): readonly unknown[];
    fetch(value: string): Promise<{ data: GetUserInvoiceCheckRes }>;
  }
> = {
  MOBILE_BARCODE: {
    key: userInvoiceQueryKeys.mobileBarcodeCheck,
    fetch: getUserInvoiceMobileBarcodeCheck,
  },
  DONATION: {
    key: userInvoiceQueryKeys.loveCodeCheck,
    fetch: getUserInvoiceLoveCodeCheck,
  },
  COMPANY: {
    key: userInvoiceQueryKeys.companyCheck,
    fetch: getUserInvoiceCompanyCheck,
  },
};

/**
 * 제출 직전처럼 "지금 당장 결과가 필요한" 자리에서 확인 API 를 기다린다.
 * `useUserInvoice*CheckQuery` 와 같은 키·같은 수명으로 캐시하므로, 이미 blur 로 확인한 값은
 * 다시 묻지 않고 반대로 여기서 받은 결과는 훅 쪽 화면에도 그대로 보인다.
 */
export const fetchUserInvoiceCheck = async (
  queryClient: QueryClient,
  type: UserInvoiceCheckType,
  value: string,
): Promise<GetUserInvoiceCheckRes> => {
  const { key, fetch } = CHECKS[type];
  const res = await queryClient.fetchQuery({
    queryKey: key(value),
    queryFn: () => fetch(value),
    staleTime: CHECK_STALE_MS,
    retry: false,
  });

  return res.data;
};
