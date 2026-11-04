"use client";

import type { HTTPError } from "ky";

import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  getUserInvoiceCompanyCheck,
  getUserInvoiceLoveCodeCheck,
  getUserInvoiceMobileBarcodeCheck,
  type GetUserInvoiceCheckRes,
} from "@shared/services/userInvoice";

import { userInvoiceQueryKeys } from "./queryKey";

interface UserInvoiceCheckArgs {
  /**
   * 형식이 맞을 때만 켠다. 자릿수가 안 맞는 값까지 서버에 묻지 않도록 호출부가
   * 로컬 검증 결과를 넘긴다. 값이 비어 있으면 어차피 부르지 않는다.
   */
  enabled?: boolean;
}

/** 같은 값은 같은 답이라 한참 들고 있어도 된다. 실패는 입력을 고치면 새 키라 재시도하지 않는다 */
const checkQueryOptions = { retry: false, staleTime: 1000 * 60 * 60 } as const;

type CheckResponse = Awaited<
  ReturnType<typeof getUserInvoiceMobileBarcodeCheck>
>;

/**
 * @description 휴대폰 바코드 載具 확인. "/" + 7자(영문 대문자·숫자·+-.)
 *
 * 재정부 장애로 확인을 못 하면 형식만 맞을 때 `valid=true, verified=false` 다 —
 * 그대로 주문해도 된다.
 */
export function useUserInvoiceMobileBarcodeCheckQuery(
  code: string,
  { enabled }: UserInvoiceCheckArgs = {},
) {
  return useAppQuery<CheckResponse, HTTPError, GetUserInvoiceCheckRes>({
    queryKey: userInvoiceQueryKeys.mobileBarcodeCheck(code),
    queryFn: () => getUserInvoiceMobileBarcodeCheck(code),
    select: (res) => res.data,
    enabled: enabled !== false && code.length > 0,
    ...checkQueryOptions,
  });
}

/**
 * @description 기부 愛心碼 확인. 숫자 3–7자리. `valid` 면 `name` 에 기부처 이름이 온다.
 * 없는 코드로 주문하면 400 이라 주문 전에 확인한다.
 */
export function useUserInvoiceLoveCodeCheckQuery(
  code: string,
  { enabled }: UserInvoiceCheckArgs = {},
) {
  return useAppQuery<CheckResponse, HTTPError, GetUserInvoiceCheckRes>({
    queryKey: userInvoiceQueryKeys.loveCodeCheck(code),
    queryFn: () => getUserInvoiceLoveCodeCheck(code),
    select: (res) => res.data,
    enabled: enabled !== false && code.length > 0,
    ...checkQueryOptions,
  });
}

/**
 * @description 統一編號 확인 · 회사명 조회. 8자리 검사코드를 확인하고, 회사명이 공개
 * 데이터에 있으면 `name` 으로 준다 (회사명 입력칸을 미리 채우는 용도).
 */
export function useUserInvoiceCompanyCheckQuery(
  taxId: string,
  { enabled }: UserInvoiceCheckArgs = {},
) {
  return useAppQuery<CheckResponse, HTTPError, GetUserInvoiceCheckRes>({
    queryKey: userInvoiceQueryKeys.companyCheck(taxId),
    queryFn: () => getUserInvoiceCompanyCheck(taxId),
    select: (res) => res.data,
    enabled: enabled !== false && taxId.length > 0,
    ...checkQueryOptions,
  });
}
