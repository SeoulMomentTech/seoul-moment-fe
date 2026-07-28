"use client";

import { useState } from "react";

import { UsersIcon } from "lucide-react";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { Empty } from "@shared/ui/empty";

import { PartnerCard } from "@entities/partner";
import { Tabs, TabsList, TabsTrigger } from "@seoul-moment/ui";

import usePartnerCategories from "../model/usePartnerCategories";
import usePartners from "../model/usePartners";

export function Partners() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: categories = [], isEmpty } = usePartnerCategories();

  /*
   * useEffect로 첫 카테고리를 주입하면 effect가 첫 페인트 뒤에 돌아
   * 탭이 없는 프레임이 한 번 렌더된다 — 그 빈 컨테이너에서 전환 모션이 재생돼버린다.
   * 파생값으로 계산하면 첫 렌더부터 활성 탭이 확정된다.
   */
  const activeId = selectedId ?? categories[0]?.id ?? null;

  const { data: partners, isFetched: isPartnersFetched } = usePartners(
    activeId ?? 0,
    !!activeId,
  );
  const t = useTranslations();

  const partnerList = partners?.list ?? [];
  const shouldShowEmpty =
    isEmpty || (isPartnersFetched && partnerList.length === 0);

  return (
    <section
      className={cn(
        "min-w-7xl relative h-[754px] px-5",
        "max-sm:h-auto max-sm:min-w-full",
      )}
    >
      <div
        className={cn(
          "z-1 relative mx-auto max-w-7xl pb-[100px] pt-[140px] max-sm:py-[50px]",
        )}
      >
        <h2
          className={cn(
            "text-title-2 mb-10 font-bold",
            "max-sm:text-title-3 max-sm:mb-10 max-sm:px-5",
          )}
        >
          {t("partners")}
        </h2>

        <div className="flex flex-col gap-10 max-sm:gap-[30px]">
          {activeId && (
            <Tabs
              className="border-b border-b-black/10 max-sm:pl-5"
              onValueChange={(value) => setSelectedId(Number(value))}
              value={activeId.toString()}
            >
              <TabsList className="flex h-[50px] items-center gap-[30px]">
                {categories.map((category) => (
                  <TabsTrigger
                    className="text-body-1"
                    key={category.id}
                    value={`${category.id}`}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {shouldShowEmpty ? (
            <Empty
              className="h-[360px] w-full max-sm:px-5"
              description={t("no_partners_found")}
              icon={
                <UsersIcon className="text-black/30" height={24} width={24} />
              }
            />
          ) : (
            /*
             * key가 바뀌면 리마운트되어 initial → animate가 다시 재생된다.
             * usePartners가 keepPreviousData를 쓰므로 전환 중 카드가 사라지지 않고
             * 새 데이터가 도착한 프레임에 크로스페이드가 시작된다.
             */
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "inline-flex gap-10 max-sm:px-5",
                "max-sm:flex-col max-sm:items-center max-sm:gap-[30px]",
              )}
              initial={{ opacity: 0, y: 8 }}
              key={`partners-${activeId}`}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {partnerList.slice(0, 3).map((item) => (
                <PartnerCard
                  className="h-[360px] w-full max-w-[400px] gap-[30px]"
                  imageUrl={item.image}
                  key={item.id}
                  link={item.link}
                  subTitle={item.description}
                  title={item.title}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
