"use client";

import { useCallback, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import type { GetProductDetailRes, OptionType } from "@shared/services/product";

import {
  createCartLineId,
  MAX_LINE_QUANTITY,
  useCart,
  type CartLineDraft,
  type CartOptionSelection,
} from "@entities/cart";
import { splitProductOptionAxes } from "@entities/product";

/** 담기 전 화면에 쌓여 있는 조합 한 줄 */
export interface DraftLine {
  key: string;
  options: CartOptionSelection[];
  quantity: number;
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
 * 선택형(값 2개 이상인 축이 있음)은 축을 전부 골라야 조합이 쌓이고, 고정형(화장품)은
 * 고를 게 없으므로 조합 1개가 처음부터 존재하고 수량만 조작한다.
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

  // 고정형은 고를 게 없으므로 조합 1개로 시작한다.
  const [lines, setLines] = useState<DraftLine[]>(() =>
    mode === "fixed"
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

  const addLine = useCallback(
    (selections: CartOptionSelection[]) => {
      const options = [...fixedSelections, ...selections];
      const key = createCartLineId(product.id, options);

      setLines((prev) => {
        const index = prev.findIndex((line) => line.key === key);
        // 이미 쌓아둔 조합을 다시 고르면 새 줄이 아니라 수량 +1
        if (index >= 0) {
          return prev.map((line, i) =>
            i === index
              ? {
                  ...line,
                  quantity: Math.min(line.quantity + 1, MAX_LINE_QUANTITY),
                }
              : line,
          );
        }
        return [...prev, { key, options, quantity: 1 }];
      });
    },
    [fixedSelections, product.id],
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

      addLine(selections as CartOptionSelection[]);

      // 선택을 리셋하지 않는다. 축 하나만 바꿔 다음 조합을 쌓는 게 실제 흐름이고
      // (색상 고정 + 사이즈만 변경 → 두 줄), 리셋하면 Radix Select 의 controlled
      // value 만 비워져 같은 값을 다시 골라도 onValueChange 가 오지 않는다.
    },
    [picked, selectable, addLine],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((prev) =>
      prev.map((line) =>
        line.key === key
          ? {
              ...line,
              quantity: Math.min(Math.max(quantity, 1), MAX_LINE_QUANTITY),
            }
          : line,
      ),
    );
  }, []);

  // 고정형은 조합이 항상 1개라 지울 수 없다 — 지우면 되살릴 선택 UI 가 없다.
  const removeLine = useCallback(
    (key: string) => {
      if (mode === "fixed") return;
      setLines((prev) => prev.filter((line) => line.key !== key));
    },
    [mode],
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

  const submit = useCallback(() => {
    if (!isAuthenticated) {
      toast.error(t("login_required"));
      return false;
    }
    if (!lines.length) return false;

    const drafts: CartLineDraft[] = lines.map((line) => ({
      productId: product.id,
      quantity: line.quantity,
      productName: product.name,
      brandId: product.brand.id,
      brandName: product.brand.name,
      brandProfileImg: product.brand.profileImg,
      imageUrl: product.subImage[0] ?? "",
      price: product.price,
      discountPrice: product.discountPrice,
      options: line.options,
      external: product.external,
    }));

    const result = addLines(drafts);

    if (result.status === "limit") {
      toast.error(t("cart_limit_reached", { max: result.max }));
      return false;
    }

    return true;
  }, [isAuthenticated, lines, product, addLines, t]);

  return {
    mode,
    selectableAxes: selectable,
    fixedAxes: fixed,
    picked,
    pickAxis,
    lines,
    setQuantity,
    removeLine,
    totalAmount,
    canSubmit,
    submit,
  };
};
