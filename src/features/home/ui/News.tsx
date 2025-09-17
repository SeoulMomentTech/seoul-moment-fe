import Link from "next/link";
import { FeaturedMainNewsCard, FeaturedSubNewsCard } from "@/entities/news/ui";

import { cn } from "@/shared/lib/style";

import { SectionWithLabel } from "@/widgets/section-with-label";

export function News() {
  // Mock data - in a real app this would come from an API
  const featuredNews = {
    author: "버켄스탁",
    date: "2025.05.30",
    title: "먼슬리킥스 Ep.22 버켄스탁",
    subTitle: "클래식으로 완성하는 여름 스타일",
    imageUrl: "https://placehold.co/460x596",
  };

  const newsItems = [
    {
      author: "버켄스탁",
      date: "2025.05.30",
      title: "먼슬리킥스 Ep.22 버켄스탁",
      subTitle: "클래식으로 완성하는 여름 스타일",
      imageUrl: "https://placehold.co/370x498",
    },
    {
      author: "버켄스탁",
      date: "2025.05.30",
      title: "먼슬리킥스 Ep.22 버켄스탁",
      subTitle: "클래식으로 완성하는 여름 스타일",
      imageUrl: "https://placehold.co/370x498",
    },
  ];

  return (
    <SectionWithLabel
      className={cn("py-[100px]", "max-sm:py-[50px]")}
      label={
        <div
          className={cn(
            "mb-[30px] flex w-full items-end justify-between",
            "max-sm:mb-[20px] max-sm:px-[20px]",
          )}
        >
          <h3 className="text-[32px] max-sm:text-[20px]">
            <b>NEWS</b>
          </h3>
          <Link className="text-[14px] hover:underline" href="/news">
            More
          </Link>
        </div>
      }
    >
      <div
        className={cn(
          "flex justify-between gap-[60px]",
          "max-sm:w-full max-sm:flex-col",
        )}
      >
        <FeaturedMainNewsCard {...featuredNews} />
        <div className="flex justify-start max-sm:justify-end">
          <FeaturedSubNewsCard {...newsItems[0]} />
        </div>
        <div>
          <FeaturedSubNewsCard {...newsItems[1]} />
        </div>
      </div>
    </SectionWithLabel>
  );
}
