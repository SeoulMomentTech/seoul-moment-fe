import type { ProductOptionType } from "@shared/services/productOption";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from "@seoul-moment/ui";

interface OptionTypeSelectorProps {
  optionType: ProductOptionType;
  isPending: boolean;
  setOptionType(value: ProductOptionType): void;
}

export function OptionTypeSelector({
  isPending,
  optionType,
  setOptionType,
}: OptionTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>옵션 분류 *</Label>
      <Select
        disabled={isPending}
        onValueChange={(value) => setOptionType(value as ProductOptionType)}
        value={optionType}
      >
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="SIZE">SIZE</SelectItem>
          <SelectItem value="COLOR">COLOR</SelectItem>
          <SelectItem value="MATERIAL">MATERIAL</SelectItem>
          <SelectItem value="FIT">FIT</SelectItem>
          <SelectItem value="STYLE">STYLE</SelectItem>
          <SelectItem value="GENDER">GENDER</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
