import { X } from "lucide-react";


import {
  useAdminProductOptionListQuery,
  useAdminProductOptionQuery,
} from "@pages/ProductOptionsPage/hooks";
import type { ProductOptionId } from "@shared/services/productOption";

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

import type { OptionValueBadge } from "../types";
import { getOptionLabel, getOptionValueLabel } from "../utils";

interface OptionValueModalProps {
  isOpen: boolean;
  onClose(): void;
  onConfirm(selectedValues: OptionValueBadge[]): void;
  onSelectOption(optionId: ProductOptionId): void;
  onToggleValue(valueId: number): void;
  selectedOptionId: ProductOptionId | null;
  selectedValueIds: number[];
}

export function OptionValueModal({
  isOpen,
  onClose,
  onConfirm,
  onSelectOption,
  onToggleValue,
  selectedOptionId,
  selectedValueIds,
}: OptionValueModalProps) {
  const { data: optionListResponse } = useAdminProductOptionListQuery({
    page: 1,
    count: 10000,
    sort: "DESC",
  });
  const { data: optionDetail } = useAdminProductOptionQuery(
    (selectedOptionId ?? 0) as ProductOptionId,
    {
      enabled: Boolean(selectedOptionId),
    },
  );

  const optionList = optionListResponse?.data.list ?? [];
  const optionValues = optionDetail?.optionValueList ?? [];

  if (!isOpen) {
    return null;
  }

  const selectedBadges: OptionValueBadge[] = optionValues
    .filter((value) => selectedValueIds.includes(value.id))
    .map((value) => ({
      id: value.id,
      label: getOptionValueLabel(value.nameDto),
      colorCode: value.colorCode ?? null,
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[520px] max-w-[92vw] rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">옵션 값 선택</h3>
          <button
            className="rounded-sm p-1 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm text-gray-800">옵션 선택</Label>
            <Select
              onValueChange={(value) =>
                onSelectOption(Number(value) as ProductOptionId)
              }
              value={selectedOptionId ? String(selectedOptionId) : ""}
            >
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="옵션을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="max-h-[260px] bg-white">
                {optionList.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {getOptionLabel(option.nameDto)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-800">옵션 값 선택</Label>
            {!selectedOptionId ? (
              <p className="text-sm text-gray-500">옵션을 먼저 선택해주세요.</p>
            ) : optionValues.length === 0 ? (
              <p className="text-sm text-gray-500">
                선택한 옵션에 등록된 값이 없습니다.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {optionValues.map((value) => {
                  const isSelected = selectedValueIds.includes(value.id);
                  const label = getOptionValueLabel(value.nameDto);

                  return (
                    <button
                      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${isSelected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                        }`}
                      key={value.id}
                      onClick={() => onToggleValue(value.id)}
                      type="button"
                    >
                      {value.colorCode && (
                        <span
                          className="h-3 w-3 rounded-full border border-black/20"
                          style={{ background: value.colorCode }}
                        />
                      )}
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose} type="button" variant="outline">
            취소
          </Button>
          <Button
            className="bg-gray-900 text-white hover:bg-gray-800"
            onClick={() => onConfirm(selectedBadges)}
            type="button"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
