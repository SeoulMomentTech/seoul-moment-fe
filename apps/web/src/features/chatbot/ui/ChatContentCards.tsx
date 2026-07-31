import { BaseImage } from "@shared/ui/base-image";

import { Link } from "@/i18n/navigation";

import { ChatCardRail } from "./ChatCardRail";
import type { ChatContentRef } from "../model/types";
import { useChatbotCopy } from "../model/useChatbotCopy";

interface ChatContentCardsProps {
  contents: ChatContentRef[];
}

export function ChatContentCards({ contents }: ChatContentCardsProps) {
  const copy = useChatbotCopy();

  if (contents.length === 0) return null;

  return (
    <ChatCardRail
      summary={`${contents.length}${copy("chatbot_contents_count")}`}
    >
      {contents.map((content) => (
        <li
          className="w-[168px] shrink-0"
          key={`${content.resource}-${content.id}`}
        >
          <Link
            className="focus-ring group/card duration-normal block overflow-hidden rounded-lg border border-black/10 transition-colors hover:border-black/30"
            href={`/${content.resource}/${content.id}`}
          >
            {/* 콘텐츠는 가로 비율이 읽기에 맞다(상품은 정사각). */}
            <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
              <BaseImage
                alt={content.title}
                className="duration-slow object-cover transition-transform group-hover/card:scale-105"
                fill
                sizes="168px"
                src={content.thumbnail}
                unoptimized
              />
            </div>
            <div className="p-2">
              {content.category && (
                <p className="text-body-5 truncate tracking-wide text-black/60">
                  {content.category}
                </p>
              )}
              <p className="text-body-4 line-clamp-2 h-[34px] leading-[17px]">
                {content.title}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ChatCardRail>
  );
}
