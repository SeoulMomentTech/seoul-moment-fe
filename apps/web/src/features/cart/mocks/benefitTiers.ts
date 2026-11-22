import type { BenefitTier } from "../lib/benefitTiers";

/**
 * 구간별 혜택 mock. 서버에 구간 API 가 아직 없어 스텝 UI 확인용으로만 쓴다.
 * 할인은 결제 금액에 반영되지 않으므로 배포 빌드에서는 쓰지 않는다 (CartList 참고).
 */
export const MOCK_BENEFIT_TIERS: BenefitTier[] = [
  { threshold: 1500, discount: 50, freeShipping: false },
  { threshold: 3000, discount: 120, freeShipping: true },
  { threshold: 5000, discount: 250, freeShipping: true },
  { threshold: 8000, discount: 450, freeShipping: true },
  { threshold: 12000, discount: 700, freeShipping: true },
];
