"use client";

import { useEffect, useState } from "react";
import { PartnerCard } from "@/entities/partner";
import { cn } from "@/shared/lib/style";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import usePartnerCategories from "../hooks/usePartnerCategories";
import usePartners from "../hooks/usePartners";

export function Partners() {
  const {
    data: categories = [],
    isFetchedAfterMount,
    isEmpty,
  } = usePartnerCategories();
  const [id, setId] = useState<string | null>();

  const { data: partners } = usePartners(Number(id ?? 1), !isEmpty);

  useEffect(() => {
    if (categories.length > 0 && isFetchedAfterMount) {
      setId(categories[0].id.toString());
    }
  }, [categories, isFetchedAfterMount]);

  console.log(partners);

  return (
    <section className={cn("relative h-[754px] px-[20px]", "max-sm:h-auto")}>
      <div
        className={cn(
          "relative z-[1] mx-auto max-w-[1280px] pt-[140px] pb-[100px] max-sm:py-[50px]",
        )}
      >
        <h2
          className={cn(
            "text-title-2 mb-[40px] font-bold",
            "max-sm:text-title-3 max-sm:mb-[40px] max-sm:px-[20px]",
          )}
        >
          협력사
        </h2>

        <div className="flex flex-col gap-[40px] max-sm:gap-[30px]">
          {id && (
            <Tabs
              className="border-b border-b-black/10 max-sm:pl-[20px]"
              defaultValue={id}
              onValueChange={setId}
            >
              <TabsList className="flex h-[50px] items-center gap-[30px]">
                {categories.map((category) => (
                  <TabsTrigger
                    className="text-[18px]"
                    key={category.id}
                    value={`${category.id}`}
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          {partners && partners.list.length > 0 && (
            <div
              className={cn(
                "flex gap-[40px] max-sm:px-[20px]",
                "max-sm:flex-col max-sm:gap-[30px]",
              )}
            >
              <PartnerCard
                className="h-[360px] w-[400px] gap-[30px]"
                imageClassName="h-[240px]"
                imageUrl=""
                subTitle="심플 브랜드 설명"
                title="서울 모먼트 Brand"
              />
              <PartnerCard
                className="h-[360px] w-[400px] gap-[30px]"
                imageClassName="h-[240px]"
                imageUrl=""
                subTitle="심플 브랜드 설명"
                title="서울 모먼트 Brand"
              />
              <PartnerCard
                className="h-[360px] w-[400px] gap-[30px]"
                imageClassName="h-[240px]"
                imageUrl=""
                subTitle="심플 브랜드 설명"
                title="서울 모먼트 Brand"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
