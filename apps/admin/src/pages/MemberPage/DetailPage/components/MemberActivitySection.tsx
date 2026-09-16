import type { ReactNode } from "react";

import { formatNumber } from "@shared/utils/format";

import { Skeleton, cn } from "@seoul-moment/ui";

const SKELETON_KEYS = ["a", "b", "c", "d"] as const;

interface MemberActivitySectionProps {
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  toolbar?: ReactNode;
  pagination?: ReactNode;
  children: ReactNode;
}

/** 활동 탭 4종이 공유하는 껍데기. 합계 줄·로딩·빈 상태·페이지네이션을 한 곳에서 맞춘다 */
export function MemberActivitySection({
  total,
  isLoading,
  isFetching,
  isEmpty,
  emptyMessage,
  toolbar,
  pagination,
  children,
}: MemberActivitySectionProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
        {isLoading ? (
          <Skeleton className="h-4 w-20" rounded />
        ) : (
          <p className="text-sm text-gray-600">
            총{" "}
            <strong className="font-semibold tabular-nums text-gray-900">
              {formatNumber(total)}
            </strong>
            건
          </p>
        )}
        {toolbar}
      </div>

      {isLoading ? (
        <div className="space-y-3 px-4 py-4">
          {SKELETON_KEYS.map((key) => (
            <Skeleton className="h-5 w-full" key={key} rounded />
          ))}
        </div>
      ) : isEmpty ? (
        <p className="px-4 py-16 text-center text-sm text-gray-500">
          {emptyMessage}
        </p>
      ) : (
        <div
          aria-busy={isFetching}
          className={cn(
            "duration-normal transition-opacity",
            isFetching && "opacity-60",
          )}
        >
          {children}
        </div>
      )}

      {!isLoading && !isEmpty && pagination}
    </div>
  );
}
