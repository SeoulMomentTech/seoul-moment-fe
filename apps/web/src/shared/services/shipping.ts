import type { CommonRes } from "./";
import { api } from "./";

export interface GetShippingPolicyRes {
  /** 본섬 배송비 */
  baseFee: number;
  /** 외섬 정상 배송비. 프로모션 중이면 실제로는 baseFee 가 적용된다 */
  remoteIslandFee: number;
  /** true 면 외섬에도 baseFee 가 적용된다 */
  remoteIslandPromotion: boolean;
  /** 무료배송 임계금액. 본섬·외섬 구분 없이 적용된다 */
  freeShippingThreshold: number;
}

/**
 * @description 배송비 정책 조회
 *
 * 상품 상세·장바구니의 배송비 안내를 프론트에 하드코딩하지 않으려고 요율을 내려준다.
 * 상세 v1 에서 `shippingCost` 가 빠진 자리를 이 값으로 안내한다.
 */
export const getShippingPolicy = () =>
  api.get("shipping-policy").json<CommonRes<GetShippingPolicyRes>>();
