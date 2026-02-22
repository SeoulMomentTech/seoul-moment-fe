import { FileTextIcon, NewspaperIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { Empty } from "@widgets/empty";

interface RelatedEmptyProps {
  type: "news" | "article";
}

export function RelatedEmpty({ type }: RelatedEmptyProps) {
  const t = useTranslations();

  const isNews = type === "news";
  const icon = isNews ? (
    <NewspaperIcon
      className="text-black/30"
      height={24}
      role="img"
      width={24}
    />
  ) : (
    <FileTextIcon className="text-black/30" height={24} role="img" width={24} />
  );

  return (
    <Empty
      className="h-[360px] w-full max-sm:h-[240px]"
      description={t(isNews ? "no_news_found" : "no_article_found")}
      icon={icon}
    />
  );
}
