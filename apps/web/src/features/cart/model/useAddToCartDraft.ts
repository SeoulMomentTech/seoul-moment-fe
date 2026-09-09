"use client";

import { useCallback, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import type { GetProductDetailRes, OptionType } from "@shared/services/product";

import {
  createCartLineId,
  getMaxLineQuantity,
  useCart,
  type CartLineDraft,
  type CartOptionSelection,
} from "@entities/cart";
import {
  findProductVariant,
  getUnavailableOptionValueIds,
  isOptionCombinationPurchasable,
  isProductSoldOut,
  listProductVariantChoices,
  splitProductOptionAxes,
} from "@entities/product";

/** 담기 전 화면에 쌓여 있는 조합 한 줄 */
export interface DraftLine {
  key: string;
  options: CartOptionSelection[];
  quantity: number;
  /** 조합을 직접 고른 경우의 SKU. 축별 선택이면 담을 때 역으로 찾는다 */
  variantId?: number;
  /**
   * 드롭다운에 보인 문구 그대로. 한 축에 값이 여러 개인 조합(혼방 소재)을 옵션 나열로
   * 다시 만들면 `나일론 / 스판덱스` 가 되어 고른 것과 다르게 읽힌다.
   */
  label?: string;
  /** 이 조합의 재고. 수량을 여기까지만 올릴 수 있다. 모르면(축별 선택) 비어 있다 */
  stockQuantity?: number;
}

const toSelection = (
  type: OptionType,
  value: { id: number; value: string },
): CartOptionSelection => ({
  type,
  optionValueId: value.id,
  value: value.value,
});

interface UseAddToCartDraftArgs {
  product: GetProductDetailRes;
}

/**
 * 상품상세 담기 상태.
 *
 * `variants` 를 받으면 조합(SKU) 하나를 select 한 개로 고른다 — 축을 하나씩 고르면
 * 존재하지 않는 조합을 만들 수 있고, 고른 값을 다시 SKU 로 번역해야 한다.
 *
 * `variants` 가 비어 있을 때만 축별 선택으로 되돌아간다. 선택형(값 2개 이상인 축이
 * 있음)은 축을 전부 골라야 조합이 쌓이고, 고정형(화장품)은 고를 게 없으므로 조합
 * 1개가 처음부터 존재하고 수량만 조작한다.
 */
export const useAddToCartDraft = ({ product }: UseAddToCartDraftArgs) => {
  const t = useTranslations();
  const { addLines } = useCart();
  const isAuthenticated = useUserAuthStore((state) => state.isAuthenticated);

  const { selectable, fixed, mode } = useMemo(
    () => splitProductOptionAxes(product.option),
    [product.option],
  );

  const fixedSelections = useMemo(
    () => fixed.map((axis) => toSelection(axis.type, axis.values[0])),
    [fixed],
  );

  /**
   * 조합(SKU) 단위로 고르는 드롭다운 항목. `variants` 가 곧 살 수 있는 조합 목록이므로
   * 축을 하나씩 고르게 하지 않고 이 목록을 그대로 한 개의 select 로 보여준다.
   */
  const variantChoices = useMemo(
    () =>
      listProductVariantChoices({
        option: product.option,
        variants: product.variants,
      }),
    [product.option, product.variants],
  );

  /** 살 수 있는 조합이 하나도 없는 상품. 옵션 선택과 담기를 통째로 잠근다 */
  const isSoldOut = isProductSoldOut(product.variants);

  /**
   * `"variant"` 면 조합 하나를 그대로 고른다. `variants` 를 못 받은 상품만 기존처럼
   * 축별로 고른다(`"selectable"` / `"fixed"`).
   */
  const selectMode: "variant" | "selectable" | "fixed" = variantChoices.length
    ? "variant"
    : mode;

  // 고정형은 고를 게 없으므로 조합 1개로 시작한다. 조합 드롭다운이 뜨는 상품은
  // 항목이 하나여도 사용자가 고르게 둔다 — 미리 쌓아두면 같은 조합이 두 줄이 된다.
  const [lines, setLines] = useState<DraftLine[]>(() =>
    selectMode === "fixed"
      ? [
          {
            key: createCartLineId(product.id, fixedSelections),
            options: fixedSelections,
            quantity: 1,
          },
        ]
      : [],
  );

  /** 축별로 현재 고른 optionValueId */
  const [picked, setPicked] = useState<Partial<Record<OptionType, number>>>({});

  // 자동 확정 축도 조합에 들어가므로 재고 판정 제약에 함께 넘긴다.
  const allAxes = useMemo(() => [...selectable, ...fixed], [selectable, fixed]);

  /** 지금 선택으로는 구매 가능한 조합이 없는 옵션값들 — selectbox 에서 비활성화한다 */
  const unavailableOptionValueIds = useMemo(
    () =>
      getUnavailableOptionValueIds({
        variants: product.variants,
        axes: allAxes,
        picked,
      }),
    [product.variants, allAxes, picked],
  );

  const pushLine = useCallback(
    (
      options: CartOptionSelection[],
      extra?: { variantId?: number; label?: string; stockQuantity?: number },
    ) => {
      const key = createCartLineId(product.id, options);

      setLines((prev) => {
        const index = prev.findIndex((line) => line.key === key);
        // 이미 쌓아둔 조합을 다시 고르면 새 줄이 아니라 수량 +1 (재고까지만)
        if (index >= 0) {
          return prev.map((line, i) =>
            i === index
              ? {
                  ...line,
                  quantity: Math.min(
                    line.quantity + 1,
                    getMaxLineQuantity(line.stockQuantity),
                  ),
                }
              : line,
          );
        }
        return [...prev, { key, options, quantity: 1, ...extra }];
      });
    },
    [product.id],
  );

  const addLine = useCallback(
    (selections: CartOptionSelection[]) =>
      pushLine([...fixedSelections, ...selections]),
    [fixedSelections, pushLine],
  );

  const pickAxis = useCallback(
    (type: OptionType, optionValueId: number) => {
      const next = { ...picked, [type]: optionValueId };
      setPicked(next);

      // 선택필요 축이 전부 채워졌을 때만 조합을 만든다.
      const selections = selectable.map((axis) => {
        const id = next[axis.type];
        const value = axis.values.find((item) => item.id === id);
        return value ? toSelection(axis.type, value) : null;
      });

      if (selections.some((selection) => selection === null)) return;

      const options = [
        ...fixedSelections,
        ...(selections as CartOptionSelection[]),
      ];

      // 값 단위 비활성화를 우회해 들어온 조합(재고가 방금 빠진 경우 등)을 여기서 막는다.
      if (
        !isOptionCombinationPurchasable(
          product.variants,
          options.map((option) => option.optionValueId),
        )
      ) {
        toast.error(t("option_sold_out"));
        return;
      }

      addLine(selections as CartOptionSelection[]);

      // 선택을 리셋하지 않는다. 축 하나만 바꿔 다음 조합을 쌓는 게 실제 흐름이고
      // (색상 고정 + 사이즈만 변경 → 두 줄), 리셋하면 Radix Select 의 controlled
      // value 만 비워져 같은 값을 다시 골라도 onValueChange 가 오지 않는다.
    },
    [picked, selectable, addLine, fixedSelections, product.variants, t],
  );

  const pickVariant = useCallback(
    (variantId: number) => {
      const choice = variantChoices.find(
        (item) => item.variantId === variantId,
      );

      if (!choice) return;

      // 품절 조합은 드롭다운에서 이미 비활성이지만, 재고가 방금 빠진 경우를 여기서 막는다.
      if (!choice.isPurchasable) {
        toast.error(t("option_sold_out"));
        return;
      }

      pushLine(choice.options, {
        variantId: choice.variantId,
        label: choice.label,
        stockQuantity: choice.stockQuantity,
      });
    },
    [variantChoices, pushLine, t],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.key === key
          ? {
              ...line,
              quantity: Math.min(
                Math.max(quantity, 1),
                getMaxLineQuantity(line.stockQuantity),
              ),
            }
          : line,
      ),
    );
  }, []);

  // 고정형은 조합이 항상 1개라 지울 수 없다 — 지우면 되살릴 선택 UI 가 없다.
  const canRemoveLines = selectMode !== "fixed";

  const removeLine = useCallback(
    (key: string) => {
      if (!canRemoveLines) return;
      setLines((prev) => prev.filter((line) => line.key !== key));
    },
    [canRemoveLines],
  );

  const unitPrice =
    product.discountPrice > 0 && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  const totalAmount = lines.reduce(
    (total, line) => total + unitPrice * line.quantity,
    0,
  );

  const canSubmit = lines.length > 0;

  const submit = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error(t("login_required"));
      return false;
    }
    if (!lines.length) return false;

    const drafts: CartLineDraft[] = lines.map((line) => ({
      productId: product.id,
      quantity: line.quantity,
      // 조합을 직접 고른 라인은 SKU 를 이미 들고 있다. 축별 선택이면 역으로 찾는다.
      // 못 찾으면 서버에 담을 방법이 없고, 그 라인은 로컬에만 남는다.
      productVariantId:
        line.variantId ??
        findProductVariant(
          product.variants,
          line.options.map((option) => option.optionValueId),
        )?.id,
      productName: product.name,
      // 로컬 카트는 brandId 를 문자열로 저장해 왔고 그 값이 localStorage 에 남아 있다.
      // 상세 v1 이 number 로 내려주더라도 저장 포맷은 유지한다.
      brandId: String(product.brand.id),
      brandName: product.brand.name,
      brandProfileImg: product.brand.profileImg,
      imageUrl: product.subImage[0] ?? "",
      price: product.price,
      discountPrice: product.discountPrice,
      options: line.options,
      external: product.external,
    }));

    // 서버 장바구니 반영은 `addLines`(useCart) 가 함께 처리한다 — 담기·수량·삭제가
    // 한 곳에서 서버로 흘러야 헤더 배지가 읽는 카운트와 어긋나지 않는다.
    const result = await addLines(drafts);

    if (result.status === "limit") {
      toast.error(t("cart_limit_reached", { max: result.max }));
      return false;
    }

    // 재고 부족은 `useCart` 가 라인을 정정하며 이미 알렸다. 여기서 또 띄우지 않는다.
    if (result.status === "stock") return false;

    return true;
  }, [isAuthenticated, lines, product, addLines, t]);

  return {
    mode,
    selectableAxes: selectable,
    fixedAxes: fixed,
    selectMode,
    isSoldOut,
    picked,
    pickAxis,
    unavailableOptionValueIds,
    variantChoices,
    pickVariant,
    lines,
    setQuantity,
    removeLine,
    canRemoveLines,
    totalAmount,
    canSubmit,
    submit,
  };
};
