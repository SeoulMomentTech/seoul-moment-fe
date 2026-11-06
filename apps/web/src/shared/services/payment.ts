import type { UserOrderPayment, UserOrderStatus } from "./userOrder";

import type { CommonRes } from "./";
import { api } from "./";

export interface GetPaymentResultRes {
  orderId: number;
  orderNumber: string;
  orderStatus: UserOrderStatus;
  /** 결제 시도. status 가 REQUESTED 면 결과가 아직 안 온 것이라 몇 초 간격으로 다시 부른다 */
  payment: UserOrderPayment;
}

/**
 * @description 결제 결과 조회 (로그인 없이).
 *
 * 결제를 마친 브라우저는 `{STOREFRONT}/payment/result?h={token}` 으로 돌아오고 그 h 값으로
 * 부른다. LINE 안에서 외부 브라우저로 넘겨 결제하면 그 브라우저에는 로그인 토큰이 없어서
 * 토큰으로 연다. 주문번호·주문 상태·결제 상태·입금 정보만 주고 이름·주소·전화번호는 없다.
 * 7일이 지나면 404.
 */
export const getPaymentResult = (token: string) =>
  api.get(`payment/result/${token}`).json<CommonRes<GetPaymentResultRes>>();
