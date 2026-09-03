"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { Checkbox } from "@shared/ui/checkbox";

interface CartSelectionBarProps {
  totalCount: number;
  selectedCount: number;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll(selected: boolean): void;
  onDeleteSelected(): void;
  onDeleteAll(): void;
  className?: string;
}

export function CartSelectionBar({
  totalCount,
  selectedCount,
  allSelected,
  someSelected,
  onToggleAll,
  onDeleteSelected,
  onDeleteAll,
  className,
}: CartSelectionBarProps) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-y border-black/10 py-3.5",
        className,
      )}
    >
      <label className="text-body-3 flex cursor-pointer items-center gap-2.5">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(event) => onToggleAll(event.target.checked)}
        />
        {t("select_all")}
        <span className="text-neutral tabular-nums">
          ({selectedCount}/{totalCount})
        </span>
      </label>

      <div className="text-body-3 text-neutral flex items-center gap-3">
        <button
          className="cursor-pointer disabled:cursor-not-allowed disabled:text-black/20"
          disabled={selectedCount === 0}
          onClick={onDeleteSelected}
          type="button"
        >
          {t("delete_selected")}
        </button>
        <span className="h-[11px] w-px bg-black/20" />
        <button className="cursor-pointer" onClick={onDeleteAll} type="button">
          {t("delete_all")}
        </button>
      </div>
    </div>
  );
}
