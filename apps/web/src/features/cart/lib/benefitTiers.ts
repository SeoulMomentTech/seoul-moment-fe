/** 구매 금액 구간별 혜택. 서버 API 가 생기면 그 응답을 이 모양으로 옮긴다. */
export interface BenefitTier {
  /** 이 구간이 적용되는 최소 상품 금액 */
  threshold: number;
  /** 할인 금액 */
  discount: number;
  /** 본섬 무료배송 포함 여부 */
  freeShipping: boolean;
}

export interface TierProgress {
  /** 금액 오름차순으로 정렬한 구간 */
  tiers: BenefitTier[];
  /** 지금 적용되는 구간의 index. 첫 구간 전이면 -1 */
  currentIndex: number;
  current: BenefitTier | null;
  next: BenefitTier | null;
  /** 진행 바 시작 금액 (현재 구간 금액, 없으면 0) */
  from: number;
  /** 진행 바 끝 금액 (다음 구간 금액, 없으면 현재 구간 금액) */
  to: number;
  /** 다음 구간까지 남은 금액. 마지막 구간이면 0 */
  remaining: number;
  /** from~to 사이 진행 비율 (0~1) */
  ratio: number;
}

/** 선택 금액이 어느 구간에 있고 다음 구간까지 얼마나 남았는지 계산한다. */
export const getTierProgress = (
  amount: number,
  tiers: ReadonlyArray<BenefitTier>,
): TierProgress | null => {
  if (!tiers.length) return null;

  const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);
  const currentIndex = sorted.findLastIndex((tier) => amount >= tier.threshold);
  const current = sorted[currentIndex] ?? null;
  const next = sorted[currentIndex + 1] ?? null;

  const from = current?.threshold ?? 0;
  const to = next?.threshold ?? from;
  const ratio = next
    ? Math.min(1, Math.max(0, (amount - from) / (to - from)))
    : 1;

  return {
    tiers: sorted,
    currentIndex,
    current,
    next,
    from,
    to,
    remaining: next ? next.threshold - amount : 0,
    ratio,
  };
};
