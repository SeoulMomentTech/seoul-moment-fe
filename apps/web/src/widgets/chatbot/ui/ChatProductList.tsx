"use client";

import { useState } from "react";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { toNTCurrency } from "@shared/lib/utils";
import type { AiConsultProduct } from "@shared/services/aiConsult";

import { Link } from "@/i18n/navigation";

import { ENTITY_LIST_VISIBLE_MAX } from "../model/types";

/** 썸네일 한 변. 브랜드·카테고리 목록과 행 높이를 맞춘다. */
const THUMBNAIL_SIZE = 44;

interface ChatProductListProps {
  products: AiConsultProduct[];
  /** 모바일에서는 새 탭으로 열어 전체화면 패널이 목적지를 덮지 않게 한다. */
  openInNewTab?: boolean;
}

/**
 * 상품 링크 목록.
 *
 * 브랜드·카테고리 목록(`ChatEntityList`)과 달리 상품은 브랜드명·가격을 함께 보여줘야
 * 해서 전용 컴포넌트로 둔다. 항목을 누르면 상품 상세(`/product/{id}`)로 이동한다.
 *
 * 썸네일은 상품 사진이라 `object-cover` 로 박스를 채운다(로고 워드마크를 담는
 * `ChatEntityList` 의 `object-contain` 과 다르다). 좁은 패널을 고려해 접힌 상태에서는
 * `ENTITY_LIST_VISIBLE_MAX` 개만 보이고 나머지는 목록 안에서 펼친다.
 */
export default function ChatProductList({
  products,
  openInNewTab,
}: ChatProductListProps) {
  const t = useTranslations();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!products.length) return null;

  const newTabProps = openInNewTab
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};

  const hiddenCount = products.length - ENTITY_LIST_VISIBLE_MAX;
  const visibleProducts =
    isExpanded || hiddenCount <= 0
      ? products
      : products.slice(0, ENTITY_LIST_VISIBLE_MAX);

  return (
    <div className="border-neutral-subtle overflow-hidden rounded-xl border">
      {visibleProducts.map((product, index) => (
        <Link
          className={[
            "hover:bg-brand/5 flex min-h-10 items-center gap-2.5 px-3.5 py-2 transition-colors",
            index > 0 && "border-neutral-subtle border-t",
          ]
            .filter(Boolean)
            .join(" ")}
          href={`/product/${product.id}`}
          key={product.id}
          {...newTabProps}
        >
          {product.image && (
            <span
              className="bg-neutral-subtle/30 flex shrink-0 items-center justify-center overflow-hidden rounded-md"
              style={{ height: THUMBNAIL_SIZE, width: THUMBNAIL_SIZE }}
            >
              <Image
                alt=""
                className="h-full w-full object-cover"
                height={THUMBNAIL_SIZE}
                src={product.image}
                width={THUMBNAIL_SIZE}
              />
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-body-5 text-neutral truncate">
              {product.brandName}
            </span>
            <span className="text-body-3 text-foreground truncate">
              {product.name}
            </span>
            <span className="text-body-4 text-brand font-semibold">
              {toNTCurrency(product.price)}
            </span>
          </span>
          <ChevronRight
            aria-hidden="true"
            className="text-brand shrink-0"
            size={15}
          />
        </Link>
      ))}

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
