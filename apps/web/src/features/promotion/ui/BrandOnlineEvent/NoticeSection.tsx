import { useTranslations } from "next-intl";

import type { GetBrandPromotionNoticeResponse } from "@/shared/services/brandPromotion";

import { Flex, cn } from "@seoul-moment/ui";

interface NoticeSectionProps {
  noticeList: GetBrandPromotionNoticeResponse[];
}

export function NoticeSection({ noticeList }: NoticeSectionProps) {
  const t = useTranslations();
  return (
    <Flex
      align="flex-start"
      className={cn(
        "w-full bg-neutral-50 py-10",
        "max-lg:w-7xl",
        "max-sm:w-full max-sm:px-5 max-sm:py-[30px]",
      )}
      direction="column"
    >
      <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-5")}>
        <p className="text-body-3 font-semibold text-black/80">
          {t("promotion_notice")}
        </p>
        <ul className="list-inside list-disc flex-col gap-3 pl-2">
          {noticeList.map((notice) => (
            <li className="gap-2.5" key={notice.id}>
              <span className="text-body-3 leading-relaxed text-black/40">
                {notice.content}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Flex>
  );
}
