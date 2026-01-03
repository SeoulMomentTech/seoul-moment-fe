import type { ProductOptionUiType } from "@shared/services/productOption";

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

interface OptionUITypeSelectorProps {
  isPending: boolean;
  uiType: ProductOptionUiType;
  setUiType(value: ProductOptionUiType): void;
}

export function OptionUITypeSelector({
  isPending,
  uiType,
  setUiType,
}: OptionUITypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>UI 타입 *</Label>
      <Select
        disabled={isPending}
        onValueChange={(value) => setUiType(value as ProductOptionUiType)}
        value={uiType}
      >
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="RADIO">RADIO</SelectItem>
          <SelectItem value="GRID">GRID</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
