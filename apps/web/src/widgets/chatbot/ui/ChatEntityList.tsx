"use client";

import { useState } from "react";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import { useTranslations } from "next-intl";

import type { AiConsultCategory } from "@shared/services/aiConsult";

import { Link } from "@/i18n/navigation";

import {
  ENTITY_LIST_VISIBLE_MAX,
  entityHref,
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
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items.length) return null;

  const hiddenCount = items.length - ENTITY_LIST_VISIBLE_MAX;
  const visibleItems =
    isExpanded || hiddenCount <= 0
      ? items
      : items.slice(0, ENTITY_LIST_VISIBLE_MAX);

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

      {/* 목록 페이지로 보내지 않고 이 자리에서 펼친다. 브랜드 목록 화면이
          아직 없어서(`app/[locale]/brand/page.tsx` 는 빈 noindex 화면) 링크를
          걸면 빈 페이지로 보내게 된다. */}
      {hiddenCount > 0 && (
        <button
          aria-expanded={isExpanded}
          className="border-neutral-subtle bg-neutral-subtle/20 text-body-4 text-neutral hover:bg-neutral-subtle/40 flex min-h-10 w-full items-center justify-between gap-2.5 border-t px-3.5 py-2 font-semibold transition-colors"
          onClick={() => setIsExpanded((prev) => !prev)}
          type="button"
        >
          {isExpanded
            ? t("chatbot_list_collapse")
            : t("chatbot_list_expand", { count: hiddenCount })}
          {isExpanded ? (
            <ChevronUp aria-hidden="true" className="shrink-0" size={15} />
          ) : (
            <ChevronDown aria-hidden="true" className="shrink-0" size={15} />
          )}
        </button>
      )}
    </div>
  );
}
