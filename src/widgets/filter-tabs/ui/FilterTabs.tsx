import { useId } from "react";
import Chip from "@/shared/ui/chip";

interface FilterTabsProps {
  options: string[];
  value: string;
  onChange(value: string): void;
}

export default function FilterTabs({
  options,
  value,
  onChange,
}: FilterTabsProps) {
  const id = useId();
  return (
    <div className="flex gap-[12px]">
      {options.map((option) => (
        <Chip
          active={option === value}
          key={`${id}-${option}`}
          onClick={() => onChange(option)}
        >
          {option}
        </Chip>
      ))}
    </div>
  );
}
