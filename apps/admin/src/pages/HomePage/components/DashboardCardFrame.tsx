import { Link } from "react-router";

import { EMPTY_VALUE, formatNumber } from "@shared/utils/format";

import { Skeleton } from "@seoul-moment/ui";

import type { DashboardCardMeta } from "../constants";

/**
 * 값 자리에 들어갈 상태. 로딩·에러·성공이 모두 같은 슬롯을 쓰기 때문에
 * 카드가 어떤 상태로 바뀌어도 높이가 변하지 않는다.
 */
export type DashboardCardSlot =
  | { type: "loading" }
  | { type: "error"; onRetry(): void }
  | { type: "count"; value: number; unit: string; subText?: string }
  | { type: "description"; text: string };

interface DashboardCardFrameProps {
  meta: DashboardCardMeta;
  slot: DashboardCardSlot;
}

function SlotContent({ slot }: { slot: DashboardCardSlot }) {
  switch (slot.type) {
    case "loading":
      return <Skeleton className="h-8 w-24" rounded />;

    case "error":
      return (
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold text-gray-300">
            {EMPTY_VALUE}
          </span>
          {/* 카드 전체를 덮는 stretched link 위로 올려야 클릭이 먹는다 */}
          <button
            className="relative z-10 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-50"
            onClick={slot.onRetry}
            type="button"
          >
            다시 불러오기
          </button>
        </div>
      );

    case "count":
      return (
        <p className="text-3xl font-semibold tabular-nums text-gray-900">
          {formatNumber(slot.value)}
          <span className="ml-1 text-base font-normal text-gray-500">
            {slot.unit}
          </span>
        </p>
      );

    case "description":
      return <p className="text-sm text-gray-500">{slot.text}</p>;
  }
}

export function DashboardCardFrame({ meta, slot }: DashboardCardFrameProps) {
  const Icon = meta.icon;
  const subText = slot.type === "count" ? slot.subText : undefined;

  return (
    <article className="relative flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            <Icon className="size-5" />
          </span>
          {/*
            보조 링크와 중첩 <a> 가 되지 않도록 카드 전체를 <Link> 로 감싸지 않고,
            제목 링크를 가상 요소로 카드 전면에 펼친다(stretched link).
          */}
          <Link
            className="text-base font-medium text-gray-900 after:absolute after:inset-0"
            to={meta.path}
          >
            {meta.label}
          </Link>
        </div>

        <div>
          <div className="flex h-9 items-center">
            <SlotContent slot={slot} />
          </div>
          <p className="mt-1 min-h-5 text-xs text-gray-500">{subText}</p>
        </div>
      </div>

      {meta.subLinks && meta.subLinks.length > 0 && (
        <footer className="relative z-10 flex flex-wrap gap-x-3 gap-y-1 border-t border-gray-200 px-5 py-3">
          {meta.subLinks.map((subLink) => (
            <Link
              className="text-xs text-gray-500 transition-colors hover:text-gray-900 hover:underline"
              key={subLink.path}
              to={subLink.path}
            >
              {subLink.label}
            </Link>
          ))}
        </footer>
      )}
    </article>
  );
}
