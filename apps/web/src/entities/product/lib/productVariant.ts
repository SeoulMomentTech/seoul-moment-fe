import type {
  DetailOption,
  OptionType,
  ProductVariant,
} from "@shared/services/product";

import { listProductOptionAxes } from "./optionAxes";

/**
 * 조합을 순서와 무관하게 비교하기 위한 키.
 * 색상 → 사이즈 순으로 고르든 그 반대든 같은 SKU 여야 한다 (`createCartLineId` 와 같은 규칙).
 */
const toVariantKey = (optionValueIds: readonly number[]) =>
  [...optionValueIds].sort((a, b) => a - b).join("-");

export const isVariantPurchasable = (variant: ProductVariant) =>
  !variant.isSoldOut && variant.stockQuantity > 0;

/**
 * 살 수 있는 조합이 하나도 없는 상품인지.
 *
 * `variants` 를 못 받은 상품은 **품절로 보지 않는다** — 재고를 모르는 것과 없는 것은 다르고,
 * 모른다는 이유로 막으면 축별 선택으로 돌아간 상품이 통째로 구매 불가가 된다.
 */
export const isProductSoldOut = (
  variants: readonly ProductVariant[],
): boolean => variants.length > 0 && !variants.some(isVariantPurchasable);

/**
 * 선택된 옵션값 조합에 해당하는 SKU(variant)를 찾는다. 없으면 `null`.
 *
 * 조합 드롭다운을 쓰면 선택 자체가 SKU 라 이 번역이 필요 없다. `variants` 가 비어
 * 축별 선택 UI 로 되돌아간 상품에서 라인이 SKU 없이 만들어졌을 때의 보루다.
 *
 * 정확 일치를 먼저 보고, 없으면 선택값을 모두 포함하는 variant 로 후퇴한다 —
 * 합집합 형태로 오는 동안에는 정확 일치가 언제나 실패하기 때문이다.
 */
export const findProductVariant = (
  variants: readonly ProductVariant[],
  optionValueIds: readonly number[],
): ProductVariant | null => {
  if (!optionValueIds.length) return null;

  const key = toVariantKey(optionValueIds);
  const exact = variants.find((v) => toVariantKey(v.optionValueIds) === key);

  if (exact) return exact;

  // 선택값을 모두 포함하는 조합 중 가장 구체적인(포함 개수가 가장 적은) 것.
  const containing = variants.filter((variant) =>
    optionValueIds.every((id) => variant.optionValueIds.includes(id)),
  );

  if (!containing.length) return null;

  return containing.reduce((best, variant) =>
    variant.optionValueIds.length < best.optionValueIds.length ? variant : best,
  );
};

/** 한 축 안에 값이 여러 개일 때(혼방 소재 등) 값끼리 잇는 문자 */
const WITHIN_AXIS = "·";
const BETWEEN_AXES = " / ";

/** 조합 드롭다운 한 줄 */
export interface ProductVariantChoice {
  variantId: number;
  /** 축 순서대로 이은 라벨 (예: `사파이어 블루 / FREE / 나일론·스판덱스`) */
  label: string;
  /** 조합을 이루는 옵션값. 장바구니 라인 옵션으로 그대로 쓴다 */
  options: Array<{ type: OptionType; optionValueId: number; value: string }>;
  stockQuantity: number;
  isPurchasable: boolean;
}

interface ProductVariantChoiceArgs {
  option: DetailOption | undefined;
  variants: readonly ProductVariant[];
}

/**
 * 옵션값 ID → 축·표시값. 라벨 키가 없는 축(`COUNTRY_OF_ORIGIN` 등)은 화면에 쓰지 않으므로
 * `listProductOptionAxes` 가 걸러낸 축만 담는다.
 */
interface IndexedOptionValue {
  type: OptionType;
  value: string;
  /** `listProductOptionAxes` 가 돌려준 축 순서 = 화면 표시 순서 */
  axisOrder: number;
}

const indexOptionValues = (option: DetailOption | undefined) => {
  const index = new Map<number, IndexedOptionValue>();

  listProductOptionAxes(option).forEach((axis, axisOrder) => {
    axis.values.forEach((value) => {
      index.set(value.id, { type: axis.type, value: value.value, axisOrder });
    });
  });

  return index;
};

/**
 * 축 하나가 한 칸을 차지하게 라벨을 만든다.
 *
 * 서버는 한 축의 값을 여러 개 담아 보낼 수 있다(혼방 소재: 나일론 + 스판덱스). 값을 그냥
 * 이으면 `나일론 / 스판덱스` 가 되어 고를 수 있는 두 축처럼 읽히므로 축 안에서는 묶는다.
 *
 * `options` 가 이미 축 순서로 정렬돼 있어야 한다 — Map 의 삽입 순서를 그대로 쓴다.
 */
const buildVariantLabel = (
  options: ReadonlyArray<{ type: OptionType; value: string }>,
): string => {
  const byAxis = new Map<OptionType, string[]>();

  options.forEach(({ type, value }) => {
    byAxis.set(type, [...(byAxis.get(type) ?? []), value]);
  });

  return [...byAxis.values()]
    .map((values) => values.join(WITHIN_AXIS))
    .join(BETWEEN_AXES);
};

/**
 * variant 를 그대로 고르는 조합 목록. 축을 하나씩 고르는 대신 완성된 조합을 한 번에 고른다.
 *
 * 조합이 곧 SKU 라 `productVariantId` 를 번역 없이 얻고, 재고·품절도 조합 단위 사실을
 * 그대로 표시할 수 있다. 서버가 상품당 조합 1개만 내려주면 항목이 하나인 드롭다운이
 * 되는데, 그게 "살 수 있는 조합은 이거 하나" 라는 사실 그대로다.
 */
export const listProductVariantChoices = ({
  option,
  variants,
}: ProductVariantChoiceArgs): ProductVariantChoice[] => {
  const index = indexOptionValues(option);

  return variants.map((variant) => {
    const options = variant.optionValueIds
      .reduce<
        Array<{
          type: OptionType;
          optionValueId: number;
          value: string;
          axisOrder: number;
        }>
      >((acc, optionValueId) => {
        const found = index.get(optionValueId);
        if (!found) return acc;

        return [
          ...acc,
          {
            type: found.type,
            optionValueId,
            value: found.value,
            axisOrder: found.axisOrder,
          },
        ];
      }, [])
      // 서버 배열 순서가 아니라 화면 축 순서(OPTION_AXIS_ORDER)를 따른다.
      .sort((a, b) => a.axisOrder - b.axisOrder);

    return {
      variantId: variant.id,
      label: buildVariantLabel(options),
      options: options.map(({ type, optionValueId, value }) => ({
        type,
        optionValueId,
        value,
      })),
      stockQuantity: variant.stockQuantity,
      isPurchasable: isVariantPurchasable(variant),
    };
  });
};
