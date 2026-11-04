import type { CommonRes } from "./";
import { api } from "./";

export interface GetUserInvoiceCheckRes {
  /**
   * 쓸 수 있는 값인지. 재정부 장애로 확인을 못 했으면 형식만 맞을 때 true 이고
   * verified 가 false 다 — 그대로 주문해도 된다
   */
  valid: boolean;
  /** ECPay(재정부)에 실제로 물어봐서 확인했는지 */
  verified: boolean;
  /** 기부처 이름(愛心碼) 또는 회사명(統編). 공개 데이터에 있을 때만 온다 */
  name?: string | null;
}

/**
 * @description 휴대폰 바코드 載具 확인. "/" + 7자(영문 대문자·숫자·+-.)
 */
export const getUserInvoiceMobileBarcodeCheck = (code: string) =>
  api
    .get("user/invoice/mobile-barcode/check", { searchParams: { code } })
    .json<CommonRes<GetUserInvoiceCheckRes>>();

/**
 * @description 기부 愛心碼 확인. 숫자 3–7자리. valid 면 name 에 기부처 이름이 온다.
 * 없는 코드로 주문하면 400 이라 주문 전에 확인한다.
 */
export const getUserInvoiceLoveCodeCheck = (code: string) =>
  api
    .get("user/invoice/love-code/check", { searchParams: { code } })
    .json<CommonRes<GetUserInvoiceCheckRes>>();

/**
 * @description 統一編號 확인 · 회사명 조회. 8자리 검사코드를 확인하고, 회사명이 공개
 * 데이터에 있으면 name 으로 준다 (회사명 입력칸을 미리 채우는 용도).
 */
export const getUserInvoiceCompanyCheck = (taxId: string) =>
  api
    .get("user/invoice/company/check", { searchParams: { taxId } })
    .json<CommonRes<GetUserInvoiceCheckRes>>();
