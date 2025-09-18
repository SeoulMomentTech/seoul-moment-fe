"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/style";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import useCategories from "../hooks/useCategories";
import usePartners from "../hooks/usePartners";

export function Collaborators() {
  const { data: categories = [], isFetchedAfterMount } = useCategories();
  const [id, setId] = useState("1");

  const { data: partners } = usePartners(Number(id ?? 1), id != null);

  useEffect(() => {
    if (categories && isFetchedAfterMount) {
      setId(categories[0].id.toString());
    }
  }, [categories, isFetchedAfterMount]);

  console.log(partners);

  return (
    <section className={cn("relative h-[754px]", "max-sm:h-auto")}>
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
          <div className="max-sm:px-[20px]" />
        </div>
      </div>
    </section>
  );
}
