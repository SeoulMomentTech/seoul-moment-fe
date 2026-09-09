import type { OptionType, ProductVariant } from "@shared/services/product";

import type { ProductOptionAxis } from "./optionAxes";
import { isVariantPurchasable } from "./productVariant";

interface OptionAvailabilityArgs {
  variants: readonly ProductVariant[];
  /** 선택 축 + 자동 확정 축. 자동 확정 값도 조합의 일부라 제약에 포함한다 */
  axes: readonly ProductOptionAxis[];
  picked: Partial<Record<OptionType, number>>;
}

/**
 * 지금 고른 값들과 함께 구매 가능한 조합이 남아 있지 않은 옵션값 ID 집합.
 *
 * 조합이 완성될 때까지 기다리지 않고 **값 단위**로 판정한다 — 사용자는 사이즈를 고르기 전에
 * "이 사이즈는 품절"을 알아야 한다. 아직 고르지 않은 축은 제약하지 않으므로 고를수록 후보가
 * 좁아진다(빨강 선택 → 빨강에 남은 사이즈만 활성).
 *
 * `variants` 가 비어 있으면 재고 정보를 못 받은 것이지 전부 품절인 게 아니므로 아무것도 막지 않는다.
 */
export const getUnavailableOptionValueIds = ({
  variants,
  axes,
  picked,
}: OptionAvailabilityArgs): Set<number> => {
  const unavailable = new Set<number>();

  if (!variants.length) return unavailable;

  const purchasable = variants.filter(isVariantPurchasable);

  for (const axis of axes) {
    for (const value of axis.values) {
      // 이 값을 고른다고 가정했을 때 만족해야 하는 옵션값들
      const required = axes.reduce<number[]>((acc, other) => {
        if (other.type === axis.type) return [...acc, value.id];

        // 값이 1개인 축은 고르지 않아도 항상 조합에 들어간다.
        const fixedId =
          other.values.length === 1 ? other.values[0].id : undefined;
        const pickedId = picked[other.type] ?? fixedId;

        return pickedId === undefined ? acc : [...acc, pickedId];
      }, []);

      const hasCandidate = purchasable.some((variant) =>
        required.every((id) => variant.optionValueIds.includes(id)),
      );

      if (!hasCandidate) unavailable.add(value.id);
    }
  }

  return unavailable;
};

/**
 * 완성된 조합을 실제로 담을 수 있는지. `variants` 가 없으면 검증하지 않고 통과시킨다.
 */
export const isOptionCombinationPurchasable = (
  variants: readonly ProductVariant[],
  optionValueIds: readonly number[],
): boolean => {
  if (!variants.length) return true;

  // 개수 일치는 요구하지 않는다. 합집합 형태로 오는 동안 개수를 맞추라고 하면
  // 정상 상품의 담기가 전부 막힌다.
  return variants.some(
    (variant) =>
      isVariantPurchasable(variant) &&
      optionValueIds.every((id) => variant.optionValueIds.includes(id)),
  );
};
