"use client";

import { ArrowUpRight, ChevronRight } from "lucide-react";

import { useTranslations } from "next-intl";

import type { AiConsultCategory } from "@shared/services/aiConsult";

import { Link } from "@/i18n/navigation";

import {
  ENTITY_LIST_VISIBLE_MAX,
  entityHref,
  viewAllHref,
  type ChatbotMessage,
} from "../model/types";

interface ChatEntityListProps {
  tag: ChatbotMessage["tag"];
  /** 브랜드 또는 카테고리. 둘 다 `{ id, name }` 형태라 한 컴포넌트로 다룬다. */
  items: Array<{ id: number; name: string }>;
  /** 소분류 목록일 때의 상위 대분류. 맥락 표시용이며 링크는 아니다. */
  parentCategory?: AiConsultCategory | null;
}

/**
 * 브랜드·카테고리 링크 목록.
 *
 * 되묻기 칩(`ChatSuggestions`)과 생김새를 다르게 둔다. 칩은 "누르면 그 문구를 다시
 * 질문"이고 이 목록은 "누르면 그 페이지로 이동"이라, 같은 모양이면 사용자가 결과를
 * 예측할 수 없다.
 *
 * 서버가 `image` URL 도 주지만 쓰지 않는다. 리치 카드를 만들지 않기로 한 결정을
 * 유지해 이름만 노출한다(PRD §5.2 · §9).
 */
export default function ChatEntityList({
  tag,
  items,
  parentCategory,
}: ChatEntityListProps) {
  const t = useTranslations();

  if (!items.length) return null;

  const visibleItems = items.slice(0, ENTITY_LIST_VISIBLE_MAX);
  const hasMore = items.length > ENTITY_LIST_VISIBLE_MAX;

  return (
    <div className="border-neutral-subtle overflow-hidden rounded-xl border">
      {parentCategory && (
        <p className="border-neutral-subtle bg-neutral-subtle/20 text-body-5 text-neutral border-b px-3.5 py-1.5">
          {`${parentCategory.name} >`}
        </p>
      )}

      {visibleItems.map((item, index) => (
        <Link
          className={[
            "text-body-3 text-brand hover:bg-brand/5 flex min-h-10 items-center justify-between gap-2.5 px-3.5 py-2 font-semibold transition-colors",
            index > 0 && "border-neutral-subtle border-t",
          ]
            .filter(Boolean)
            .join(" ")}
          href={entityHref(tag, item.id)}
          key={item.id}
        >
          {item.name}
          <ChevronRight aria-hidden="true" className="shrink-0" size={15} />
        </Link>
      ))}

      {/* 항목 링크와 아이콘을 달리 준다. 항목은 그 대상 하나로 들어가고 이 링크는
          목록 페이지로 나가므로, 같은 chevron 이면 목적지를 구분할 수 없다. */}
      {hasMore && (
        <Link
          className="border-neutral-subtle bg-neutral-subtle/20 text-body-4 text-neutral hover:bg-neutral-subtle/40 flex min-h-10 items-center justify-between gap-2.5 border-t px-3.5 py-2 font-semibold transition-colors"
          href={viewAllHref(tag, parentCategory)}
        >
          {t("chatbot_view_all", { count: items.length })}
          <ArrowUpRight aria-hidden="true" className="shrink-0" size={15} />
        </Link>
      )}
    </div>
  );
}
