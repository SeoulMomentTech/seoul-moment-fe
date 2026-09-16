import { RotateCcw, X } from "lucide-react";

import { formatNumber } from "@shared/utils/format";

import { Skeleton } from "@seoul-moment/ui";

import type { MemberFilterChip } from "../hooks";

interface MemberResultBarProps {
  totalCount: number;
  isLoading: boolean;
  chips: MemberFilterChip[];
  onReset(): void;
}

export function MemberResultBar({
  totalCount,
  isLoading,
  chips,
  onReset,
}: MemberResultBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-200 bg-white px-4 py-3">
      {isLoading ? (
        <Skeleton className="h-4 w-20" rounded />
      ) : (
        <p className="shrink-0 text-sm text-gray-600">
          총{" "}
          <strong className="font-semibold tabular-nums text-gray-900">
            {formatNumber(totalCount)}
          </strong>
          명
        </p>
      )}

      {chips.length > 0 && (
        <>
          <span aria-hidden className="h-4 w-px shrink-0 bg-gray-200" />

          <ul className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <li
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-gray-200 bg-gray-50 py-1 pl-2.5 pr-1 text-xs"
                key={chip.key}
              >
                <span className="shrink-0 text-gray-500">{chip.label}</span>
                <span className="truncate font-medium text-gray-900">
                  {chip.value}
                </span>
                <button
                  aria-label={`${chip.label} 필터 해제`}
                  className="duration-normal shrink-0 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                  onClick={chip.onRemove}
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>

          <button
            className="duration-normal ml-auto inline-flex shrink-0 items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-900"
            onClick={onReset}
            type="button"
          >
            <RotateCcw className="size-3" />
            전체 해제
          </button>
        </>
      )}
    </div>
  );
}
