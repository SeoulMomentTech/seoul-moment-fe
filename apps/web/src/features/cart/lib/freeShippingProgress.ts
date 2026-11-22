export interface FreeShippingProgress {
  /** 선택 금액이 무료배송 기준 이상인지 */
  achieved: boolean;
  /** 무료배송까지 남은 금액. 달성했으면 0 */
  remaining: number;
  /** 진행 바 채움 비율 (0~1) */
  ratio: number;
}

/**
 * 장바구니 혜택 진행 카드의 무료배송 진행도.
 *
 * `estimateShipping` 의 `amountToFreeShipping` 을 그대로 쓰지 않는다 — 그 값은 아무것도
 * 고르지 않았을 때도 0 이라 "달성"으로 읽힌다. 진행 바는 선택 0원일 때 기준 금액 전체가
 * 남은 것으로 보여야 한다. 기준이 없으면(`threshold` 0) 그릴 진행도가 없다.
 */
export const getFreeShippingProgress = ({
  amount,
  threshold,
}: {
  amount: number;
  threshold: number;
}): FreeShippingProgress | null => {
  if (threshold <= 0) return null;

  const achieved = amount >= threshold;

  return {
    achieved,
    remaining: achieved ? 0 : threshold - amount,
    ratio: Math.min(1, Math.max(0, amount / threshold)),
  };
};
