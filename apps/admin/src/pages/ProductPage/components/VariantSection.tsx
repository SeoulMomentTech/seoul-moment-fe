import { Plus, Trash2 } from "lucide-react";

import { Button, Input, Label } from "@seoul-moment/ui";

import { OptionBadge } from "./OptionBadge";
import type { VariantForm } from "../types";
import { parseOptionValueIds } from "../utils";

interface VariantSectionProps {
  error?: string;
  isPending: boolean;
  onAddVariant(): void;
  onOpenOptionModal(index: number): void;
  onRemoveVariant(index: number): void;
  onUpdateVariant(index: number, nextVariant: VariantForm): void;
  onVariantChange(
    index: number,
    field: keyof VariantForm,
    value: VariantForm[keyof VariantForm],
  ): void;
  variants: VariantForm[];
}

export function VariantSection({
  error,
  isPending,
  onAddVariant,
  onOpenOptionModal,
  onRemoveVariant,
  onUpdateVariant,
  onVariantChange,
  variants,
}: VariantSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">상품 변형 (Variants)</h3>
            <p className="mt-1 text-sm text-gray-600">
              SKU, 재고, 옵션 조합을 설정하세요.
            </p>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <Button
            className="bg-gray-900 text-white hover:bg-gray-800"
            onClick={onAddVariant}
            size="sm"
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" />
            변형 추가
          </Button>
        </div>
      </div>
      <div className="space-y-4 px-6 py-5">
        {variants.map((variant, index) => (
          <div
            className="rounded-lg border border-gray-200 bg-white p-4"
            key={`variant-${index + 1}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">
                변형 #{index + 1}
              </p>
              {variants.length > 1 && (
                <Button
                  className="text-red-500 hover:text-red-600"
                  onClick={() => onRemoveVariant(index)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`variant-sku-${index}`}>
                  SKU <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-[40px] bg-gray-50"
                  disabled={isPending}
                  id={`variant-sku-${index}`}
                  onChange={(event) =>
                    onVariantChange(index, "sku", event.target.value)
                  }
                  placeholder="예: NK-TS-RED-M"
                  value={variant.sku}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`variant-stock-${index}`}>
                  재고 수량 <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-[40px] bg-gray-50"
                  disabled={isPending}
                  id={`variant-stock-${index}`}
                  onChange={(event) =>
                    onVariantChange(index, "stockQuantity", event.target.value)
                  }
                  placeholder="0"
                  type="number"
                  value={variant.stockQuantity}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor={`variant-options-${index}`}>
                옵션 값 선택 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Plus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <button
                  className="h-[40px] w-full cursor-pointer rounded-md bg-gray-50 px-10 text-left text-sm text-gray-700"
                  disabled={isPending}
                  id={`variant-options-${index}`}
                  onClick={() => onOpenOptionModal(index)}
                  type="button"
                >
                  옵션 값 추가/수정
                </button>
              </div>
              {(variant.optionValueBadgeList?.length ?? 0) > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {variant.optionValueBadgeList?.map((badge) => (
                      <OptionBadge
                        colorCode={badge.colorCode}
                        key={badge.id}
                        label={badge.label}
                        onClick={() => {
                          const nextBadges =
                            variant.optionValueBadgeList?.filter(
                              (item) => item.id !== badge.id,
                            ) ?? [];
                          onUpdateVariant(index, {
                            ...variant,
                            optionValueBadgeList: nextBadges,
                            optionValueIds: nextBadges
                              .map((item) => item.id)
                              .join(", "),
                          });
                        }}

                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    선택된 옵션 ID: [
                    {variant.optionValueBadgeList
                      ?.map((badge) => badge.id)
                      .join(", ") ??
                      parseOptionValueIds(variant.optionValueIds).join(", ")}
                    ]
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
