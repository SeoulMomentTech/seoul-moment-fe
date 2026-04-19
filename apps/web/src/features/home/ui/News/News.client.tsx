"use client";

import { use } from "react";

import { NewspaperIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { getNewsList, News } from "@shared/services/news";

import { Empty } from "@widgets/empty";
import { SectionWithLabel } from "@widgets/section-with-label";

import { NewsDesktopSlider } from "./NewsDesktopSlider";
import { NewsMobileSlider } from "./NewsMobileSlider";

interface NewsProps {
  promise: ReturnType<typeof getNewsList>;
}

export function News({ promise }: NewsProps) {
  const res = use(promise);

  return (
    <SectionWithLabel
      className={cn("w-[1280px] pt-[100px]", "max-sm:w-full max-sm:pt-[50px]")}
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-[20px] max-sm:px-[20px]",
          )}
        >
          <h3 className="text-title-2 max-sm:text-title-4">
            <b>NEWS</b>
          </h3>
        </div>
      }
    >
      <NewsContents data={res.data.list} />
    </SectionWithLabel>
  );
}

export interface NewsContentsProps {
  data: News[];
}

export function NewsContents({ data }: NewsContentsProps) {
  const t = useTranslations();
  const isEmpty = data.length === 0;

  if (isEmpty) {
    return (
      <Empty
        className="h-[360px] w-full max-sm:h-[240px]"
        description={t("no_news_found")}
        icon={
          <NewspaperIcon
            className="text-black/30"
            height={24}
            role="img"
            width={24}
          />
        }
      />
    );
  }

  return (
    <>
      <NewsDesktopSlider data={data} />
      <NewsMobileSlider data={data} />
    </>
  );
}
