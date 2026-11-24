import type { UserInternationalDiscount } from "@shared/services/userCart";

export interface DiscountProgress {
  /** 지금 받는 할인액. 0 이면 아직 첫 구간 전이다 */
  applied: number;
  /** 지금 무료배송 기준을 넘었는지 */
  appliedFreeShipping: boolean;
  /** 다음 구간. 마지막 구간이면 null */
  next: {
    threshold: number;
    discount: number;
    /** 다음 구간까지 남은 금액 */
    remaining: number;
    /** 다음 구간에 닿으면 무료배송 기준도 함께 넘는지 */
    freeShipping: boolean;
  } | null;
  /** 진행 바 끝 금액 (다음 구간 금액, 마지막 구간이면 현재 금액) */
  to: number;
  /** 0~to 사이 진행 비율 (0~1) */
  ratio: number;
}

/**
 * 장바구니 혜택 진행 카드의 국제배송비 지원 할인 진행도.
 *
 * 서버는 구간 전체가 아니라 **다음 구간 하나**만 주므로 진행 바는 0 부터 다음 구간까지 잰다.
 * `amount` 는 서버가 구간을 잰 금액(장바구니 전체의 구매 가능 라인 합)이어야 남은 금액과 맞는다.
 * 할인액도 다음 구간도 없으면 기능이 꺼진 것이라 null 이다.
 *
 * 무료배송은 할인과 따로 정해지지만 같은 금액으로 판정하므로, 다음 구간이 무료배송 기준을
 * 함께 넘으면 두 혜택을 한 문장으로 안내할 수 있게 `next.freeShipping` 을 켠다.
 */
export const getDiscountProgress = ({
  amount,
  freeShippingThreshold,
  internationalDiscount,
  nextDiscountThreshold,
  nextDiscountAmount,
  amountToNextDiscount,
}: UserInternationalDiscount & {
  amount: number;
  /** 무료배송 기준 금액. 0 이면 무료배송을 함께 안내하지 않는다 */
  freeShippingThreshold: number;
}): DiscountProgress | null => {
  const hasFreeShipping = freeShippingThreshold > 0;
  const appliedFreeShipping =
    hasFreeShipping && amount >= freeShippingThreshold;

  const next =
    nextDiscountThreshold != null && nextDiscountAmount != null
      ? {
          threshold: nextDiscountThreshold,
          discount: nextDiscountAmount,
          remaining: amountToNextDiscount,
          freeShipping:
            hasFreeShipping &&
            !appliedFreeShipping &&
            nextDiscountThreshold >= freeShippingThreshold,
        }
      : null;

  if (!next && internationalDiscount <= 0) return null;

  return {
    applied: internationalDiscount,
    appliedFreeShipping,
    next,
    to: next?.threshold ?? amount,
    ratio: next ? Math.min(1, Math.max(0, amount / next.threshold)) : 1,
  };
};
