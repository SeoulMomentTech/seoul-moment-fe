import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@seoul-moment/ui";

const DEFAULT_OPTIONS = [10, 20, 50] as const;

interface PageSizeSelectProps {
  value: number;
  onChange(size: number): void;
  options?: readonly number[];
}

export function PageSizeSelect({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
}: PageSizeSelectProps) {
  return (
    <Select
      onValueChange={(v) => onChange(Number(v))}
      value={value.toString()}
    >
      <SelectTrigger className="w-32 bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="**:cursor-pointer bg-white">
        {options.map((size) => (
          <SelectItem key={size} value={size.toString()}>
            {size}개씩
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
