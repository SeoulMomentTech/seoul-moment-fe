import type {
  ProductDetailOption,
  ProductVariant,
} from "@shared/services/product";

import { listOptionAxes } from "./options";

/** 한 축 안에 값이 여러 개일 때(혼방 소재 등) 값끼리 잇는 문자. */
const WITHIN_AXIS = "·";
const BETWEEN_AXES = " / ";

export const isVariantPurchasable = (variant: ProductVariant) =>
  !variant.isSoldOut && variant.stockQuantity > 0;

/**
 * 살 수 있는 조합이 하나도 없는 상품인지.
 *
 * 조합을 하나도 못 받은 상품은 **품절로 보지 않는다** — 재고를 모르는 것과 없는 것은 다르다.
 * 다만 담기는 조합 id 를 요구하므로, 그런 상품은 담기 자체가 불가능하다(호출부가 따로 본다).
 */
export const isProductSoldOut = (variants: readonly ProductVariant[]) =>
  variants.length > 0 && !variants.some(isVariantPurchasable);

/** 고를 수 있는 조합 한 줄. */
export interface ProductVariantChoice {
  variantId: number;
  /** 축 순서대로 이은 이름 (예: `Sapphire Blue / FREE / 尼龍 89%·彈性纖維`). */
  label: string;
  stockQuantity: number;
  isPurchasable: boolean;
}

interface IndexedValue {
  type: string;
  value: string;
  /** listOptionAxes 가 돌려준 축 순서 = 화면 표시 순서. */
  axisOrder: number;
}

const indexOptionValues = (option: ProductDetailOption | undefined) => {
  const index = new Map<number, IndexedValue>();

  listOptionAxes(option).forEach((axis, axisOrder) => {
    axis.values.forEach((value) => {
      index.set(value.id, { type: axis.type, value: value.value, axisOrder });
    });
  });

  return index;
};

/**
 * 축 하나가 한 칸을 차지하도록 이름을 만든다.
 *
 * 서버는 한 축에 값을 여러 개 담아 보낼 수 있다(혼방 소재: 나일론 + 스판덱스). 그냥 이으면
 * `나일론 / 스판덱스` 가 되어 고를 수 있는 두 축처럼 읽히므로 축 안에서는 다른 문자로 묶는다.
 */
const buildLabel = (values: { type: string; value: string }[]) => {
  const byAxis = new Map<string, string[]>();

  values.forEach(({ type, value }) => {
    byAxis.set(type, [...(byAxis.get(type) ?? []), value]);
  });

  return [...byAxis.values()]
    .map((group) => group.join(WITHIN_AXIS))
    .join(BETWEEN_AXES);
};

/**
 * 조합(SKU)을 그대로 고르는 목록. 축을 하나씩 고르게 하지 않는 이유가 있다 —
 * 축별로 고르면 존재하지 않는 조합을 만들 수 있고, 고른 값을 다시 조합 id 로 번역해야 한다.
 * 조합이 곧 SKU 라 번역이 필요 없고, 재고·품절도 조합 단위 사실 그대로 적을 수 있다.
 *
 * 웹 listProductVariantChoices 와 같은 규칙이다(앱은 담을 때 조합 id 만 보내므로
 * 옵션값 목록까지는 들고 다니지 않는다).
 */
export const listProductVariantChoices = ({
  option,
  variants,
}: {
  option: ProductDetailOption | undefined;
  variants: readonly ProductVariant[];
}): ProductVariantChoice[] => {
  const index = indexOptionValues(option);

  return variants.map((variant) => {
    const values = variant.optionValueIds
      .flatMap((id) => {
        const found = index.get(id);
        return found ? [found] : [];
      })
      // 서버 배열 순서가 아니라 화면 축 순서를 따른다.
      .sort((a, b) => a.axisOrder - b.axisOrder);

    return {
      variantId: variant.id,
      // 이름에 쓸 축이 하나도 없는 조합(옵션이 전부 숨긴 축인 상품)은 sku 로 적는다.
      label: values.length > 0 ? buildLabel(values) : variant.sku,
      stockQuantity: variant.stockQuantity,
      isPurchasable: isVariantPurchasable(variant),
    };
  });
};
