import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

import { useAdminProductOptionListQuery } from "../hooks";

export function OptionTypeSelector() {
  const { data } = useAdminProductOptionListQuery({
    count: 10000,
  });

  const types = data?.data.list.map((item) => item.type) ?? [];

  return (
    <div className="space-y-2">
      <Select value="none">
        <SelectTrigger className="bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] bg-white">
          <SelectItem disabled value="none">
            옵션 분류 리스트
          </SelectItem>
          {types.map((type) => (
            <SelectItem disabled value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
