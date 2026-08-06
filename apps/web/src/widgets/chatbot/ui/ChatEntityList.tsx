"use client";

import { useState } from "react";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import Image from "next/image";
import { useTranslations } from "next-intl";

import type { AiConsultCategory } from "@shared/services/aiConsult";

import { Link } from "@/i18n/navigation";

import {
  ENTITY_LIST_VISIBLE_MAX,
  entityHref,
  type ChatbotMessage,
} from "../model/types";

/** 썸네일 한 변. 행 높이를 크게 늘리지 않는 선에서 로고를 알아볼 수 있는 크기다. */
const THUMBNAIL_SIZE = 36;

interface ChatEntityListProps {
  tag: ChatbotMessage["tag"];
  /**
   * 브랜드 또는 카테고리. 둘 다 `{ id, name, image }` 형태라 한 컴포넌트로 다룬다.
   * `image` 는 대분류에서 항상 `null` 이므로 없을 수 있다고 보고 다뤄야 한다.
   */
  items: Array<{ id: number; name: string; image: string | null }>;
  /** 소분류 목록일 때의 상위 대분류. 맥락 표시용이며 링크는 아니다. */
  parentCategory?: AiConsultCategory | null;
  /** 모바일에서는 새 탭으로 열어 전체화면 패널이 목적지를 덮지 않게 한다. */
  openInNewTab?: boolean;
}

/**
 * 브랜드·카테고리 링크 목록.
 *
 * 되묻기 칩(`ChatSuggestions`)과 생김새를 다르게 둔다. 칩은 "누르면 그 문구를 다시
 * 질문"이고 이 목록은 "누르면 그 페이지로 이동"이라, 같은 모양이면 사용자가 결과를
 * 예측할 수 없다.
 *
 * 카드가 아니라 **행 앞 썸네일**이다(PRD §5.2). 브랜드 이미지는 이름이 박힌 워드마크
 * 로고이고 비율이 1:1 과 2:1 로 섞여 있어서, 카드로 만들면 이름이 캡션과 중복되고
 * 고정 비율 박스에서 레터박싱이 커진다. 대분류는 `image` 가 아예 없어 카드 그리드로는
 * 같은 자리에서 레이아웃이 갈린다.
 */
export default function ChatEntityList({
  tag,
  items,
  parentCategory,
  openInNewTab,
}: ChatEntityListProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items.length) return null;

  const newTabProps = openInNewTab
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};

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
          {...newTabProps}
        >
          {/* 정사각 고정 박스 + object-contain. 로고에 배경색이 박혀 있고 비율이
              1:1~2:1 로 섞여 있어서 cover 로 채우면 잘린다. 크기를 박스에 주는
              이유는 Tailwind preflight 의 `img { height: auto }` 가 next/image 의
              height 를 덮어써서, 이미지에만 맡기면 행 높이가 원본 비율대로
              들쭉날쭉해지기 때문이다. */}
          {item.image && (
            <span
              className="bg-neutral-subtle/30 flex shrink-0 items-center justify-center overflow-hidden rounded-md"
              style={{ height: THUMBNAIL_SIZE, width: THUMBNAIL_SIZE }}
            >
              <Image
                alt=""
                className="max-h-full max-w-full object-contain"
                height={THUMBNAIL_SIZE}
                src={item.image}
                width={THUMBNAIL_SIZE}
              />
            </span>
          )}
          <span className="flex-1">{item.name}</span>
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
