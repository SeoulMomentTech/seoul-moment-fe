import { useState } from "react";

import type { ProductOptionId } from "@shared/services/productOption";

import type { OptionValueBadge, VariantForm } from "../types";
import { parseOptionValueIds } from "../utils";

interface UseOptionValueModalProps {
  onUpdateVariants(newVariants: VariantForm[]): void;
  variants: VariantForm[];
}

export const useOptionValueModal = ({
  onUpdateVariants,
  variants,
}: UseOptionValueModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(
    null,
  );
  const [selectedOptionId, setSelectedOptionId] =
    useState<ProductOptionId | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<number[]>([]);

  const openModal = (index: number) => {
    setActiveVariantIndex(index);
    setSelectedOptionId(null);
    setSelectedValueIds(
      parseOptionValueIds(variants[index]?.optionValueIds ?? ""),
    );
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setActiveVariantIndex(null);
    setSelectedOptionId(null);
    setSelectedValueIds([]);
  };

  const selectOption = (optionId: ProductOptionId) => {
    setSelectedOptionId(optionId);
    setSelectedValueIds([]);
  };

  const toggleValue = (valueId: number) => {
    setSelectedValueIds((prev) =>
      prev.includes(valueId)
        ? prev.filter((item) => item !== valueId)
        : [...prev, valueId],
    );
  };

  const confirmSelection = (badges: OptionValueBadge[]) => {
    if (!selectedOptionId) {
      alert("옵션을 선택해주세요.");
      return;
    }

    if (selectedValueIds.length === 0) {
      alert("옵션 값을 선택해주세요.");
      return;
    }

    if (activeVariantIndex === null) {
      closeModal();
      return;
    }

    const nextVariants = variants.map((variant, index) => {
      if (index !== activeVariantIndex) {
        return variant;
      }

      const mergedValueIds = Array.from(
        new Set([
          ...parseOptionValueIds(variant.optionValueIds),
          ...selectedValueIds,
        ]),
      );
      const mergedBadges = [
        ...(variant.optionValueBadgeList ?? []),
        ...badges,
      ].reduce<OptionValueBadge[]>((acc, badge) => {
        if (acc.some((item) => item.id === badge.id)) {
          return acc;
        }
        acc.push(badge);
        return acc;
      }, []);

      return {
        ...variant,
        optionValueIds: mergedValueIds.join(", "),
        optionValueBadgeList: mergedBadges,
      };
    });

    onUpdateVariants(nextVariants);
    closeModal();
  };

  return {
    isOpen,
    selectedOptionId,
    selectedValueIds,
    openModal,
    closeModal,
    selectOption,
    toggleValue,
    confirmSelection,
  };
};
