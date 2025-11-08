"use client";

import { Tabs, TabsList, TabsTrigger } from "@seoul-moment/ui";
import { UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { PartnerCard } from "@entities/partner";
import { cn } from "@shared/lib/style";
import { Empty } from "@widgets/empty";
import usePartnerCategories from "../model/usePartnerCategories";
import usePartners from "../model/usePartners";

export function Partners() {
  const [id, setId] = useState<number | null>();

  const {
    data: categories = [],
    isFetchedAfterMount,
    isEmpty,
  } = usePartnerCategories();
  const { data: partners, isFetched: isPartnersFetched } = usePartners(
    id ?? 0,
    !isEmpty && !!id,
  );

  const partnerList = partners?.list ?? [];
  const shouldShowEmpty =
    isEmpty || (isPartnersFetched && partnerList.length === 0);

  useEffect(() => {
    if (categories.length > 0 && isFetchedAfterMount) {
      setId(categories[0].id);
    }
  }, [categories, isFetchedAfterMount]);

  return (
    <section
      className={cn(
        "relative h-[754px] min-w-[1280px] px-[20px]",
        "max-sm:h-auto max-sm:min-w-full",
      )}
    >
      <div
        className={cn(
          "relative z-[1] mx-auto max-w-[1280px] pb-[100px] pt-[140px] max-sm:py-[50px]",
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
              defaultValue={id.toString()}
              onValueChange={(value) => setId(Number(value))}
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
          {shouldShowEmpty ? (
            <Empty
              className="h-[360px] w-full max-sm:px-[20px]"
              description="등록된 협력사가 없습니다."
              icon={
                <UsersIcon className="text-black/30" height={24} width={24} />
              }
            />
          ) : (
            partnerList.length > 0 && (
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
            )
          )}
        </div>
      </div>
    </section>
  );
}
