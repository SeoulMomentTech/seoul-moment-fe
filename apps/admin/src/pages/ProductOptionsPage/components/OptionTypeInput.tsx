import type { ProductOptionType } from "@shared/services/productOption";

import { Label, Input } from "@seoul-moment/ui";

import { OptionTypeSelector } from "./OptionTypeSelector";

interface OptionTypeInputProps {
  optionType: ProductOptionType;
  isPending: boolean;
  setOptionType(value: ProductOptionType): void;
}

export function OptionTypeInput({
  isPending,
  optionType,
  setOptionType,
}: OptionTypeInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>옵션 분류 *</Label>
      </div>
      <OptionTypeSelector />
      <Input
        className="h-[36px] rounded-md bg-white"
        disabled={isPending}
        onChange={(e) => setOptionType(e.target.value)}
        placeholder="옵션 분류를 입력하세요"
        required
        value={optionType}
      />
    </div>
  );
}
