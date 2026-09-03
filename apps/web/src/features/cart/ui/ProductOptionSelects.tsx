"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { OptionType } from "@shared/services/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@shared/ui/select";

import type { ProductOptionAxis } from "@entities/product";

interface ProductOptionSelectsProps {
  axes: ReadonlyArray<ProductOptionAxis>;
  picked: Partial<Record<OptionType, number>>;
  onPick(type: OptionType, optionValueId: number): void;
  className?: string;
}

/**
 * 축별 selectbox. 디자인은 색상·사이즈 2개 고정이지만 개수는 데이터가 정한다.
 * 고정형(고를 축이 없는 화장품 등)이면 축 배열이 비어 아무것도 렌더하지 않는다.
 */
export function ProductOptionSelects({
  axes,
  picked,
  onPick,
  className,
}: ProductOptionSelectsProps) {
  const t = useTranslations();

  if (!axes.length) return null;

  return (
    <div className={cn("grid gap-2.5", className)}>
      {axes.map((axis) => {
        const value = picked[axis.type];
        const label = t(axis.labelKey);
        const selected = axis.values.find((option) => option.id === value);

        return (
          <Select
            key={axis.type}
            onValueChange={(next) => onPick(axis.type, Number(next))}
            value={value ? String(value) : undefined}
          >
            <SelectTrigger
              aria-label={label}
              className="text-body-3 h-12 rounded-[4px] px-3"
            >
              {/* 값만 남기면 축이 3개 이상인 상품에서 무엇을 고른 건지 알 수 없다.
                  디자인은 색상·사이즈 2축 전제였고 실제 데이터는 소재·핏도 온다. */}
              <span className={cn(!selected && "text-neutral")}>
                {selected ? `${label} · ${selected.value}` : label}
              </span>
            </SelectTrigger>
            <SelectContent>
              {axis.values.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
    </div>
  );
}
