"use client";

import { useState, useEffect } from "react";

import { ChevronDown } from "lucide-react";

import { cn } from "@shared/lib/style";

import { Button } from "@seoul-moment/ui";
import { Tabs, TabsList, TabsTrigger } from "@seoul-moment/ui";
import { LookbookGallery } from "@widgets/lookbook-gallery";
import { SectionWithLabel } from "@widgets/section-with-label";

export function LookbookSection() {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    // This is where data fetching logic will go based on filter and page
    // For now, it's a placeholder.
  }, [filter, page]);

  return (
    <SectionWithLabel
      className="pb-[100px] pt-[140px] max-sm:pb-[50px]"
      label={
        <div className={cn("mb-[30px]", "max-sm:mb-[20px] max-sm:px-[20px]")}>
          <h3 className={cn("text-[32px]", "max-sm:text-[20px]")}>
            <b>LOOKBOOK</b>
          </h3>
        </div>
      }
    >
      <Tabs
        className="border-b border-b-black/10 max-sm:pl-[20px]"
        defaultValue={filter}
        onValueChange={setFilter}
      >
        <TabsList className="flex h-[50px] items-center gap-[30px]">
          <TabsTrigger className="text-[18px]" value="all">
            All
          </TabsTrigger>
          <TabsTrigger className="text-[18px]" value="fashion">
            Fashion
          </TabsTrigger>
          <TabsTrigger className="text-[18px]" value="beauty">
            Beauty
          </TabsTrigger>
          <TabsTrigger className="text-[18px]" value="accessories">
            Accessories
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mb-[20px] mt-[40px] flex justify-between max-sm:px-[20px]">
        <span>총 1,002,622</span>
        <div className="flex gap-[4px]">
          인기순
          <ChevronDown height={16} width={16} />
        </div>
      </div>
      <LookbookGallery />
      <div
        className={cn(
          "mt-[32px] flex items-center justify-center",
          "max-sm:mt-[28px] max-sm:px-[20px]",
        )}
      >
        <Button
          className={cn(
            "rounded-[4px] border border-black/20 bg-white px-[20px] py-[16px] text-black",
            "cursor-pointer hover:bg-white",
            "max-sm:w-full",
          )}
          onClick={() => setPage((p) => p + 1)}
        >
          더보기
        </Button>
      </div>
    </SectionWithLabel>
  );
}
