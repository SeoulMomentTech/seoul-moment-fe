"use client";

import { cn } from "@shared/lib/style";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@seoul-moment/ui";

import { InterestBrandTab } from "./InterestBrandTab";
import { InterestProductTab } from "./InterestProductTab";
import { InterestRecentTab } from "./InterestRecentTab";
import { useMyPageTab, type MyPageTab } from "../model/useMyPageTab";

interface InterestSectionProps {
  className?: string;
}

const TRIGGER_CLASS =
  "h-auto flex-none rounded-none border-b-2 border-transparent bg-transparent px-0 pb-[16px] pt-[10px] text-body-3 font-semibold text-black/40 data-[state=active]:border-b-black data-[state=active]:text-black max-sm:data-[state=active]:font-semibold sm:pt-[12px] sm:pb-[20px] sm:text-body-2 sm:font-medium";

export function InterestSection({ className }: InterestSectionProps) {
  const { tab, setTab } = useMyPageTab();

  return (
    <section className={cn("flex flex-col gap-5", className)}>
      <h2 className="text-title-4 sm:text-title-3 font-bold text-black">
        관심
      </h2>

      <Tabs
        className="gap-6"
        onValueChange={(v) => setTab(v as MyPageTab)}
        value={tab}
      >
        <TabsList className="h-auto w-full justify-start gap-[20px] rounded-none border-b border-b-black/10 bg-transparent p-0 sm:gap-[30px]">
          <TabsTrigger className={TRIGGER_CLASS} value="product">
            상품
          </TabsTrigger>
          <TabsTrigger className={TRIGGER_CLASS} value="brand">
            브랜드
          </TabsTrigger>
          <TabsTrigger className={TRIGGER_CLASS} value="recent">
            최근 본 상품
          </TabsTrigger>
        </TabsList>

        <TabsContent value="product">
          <InterestProductTab />
        </TabsContent>
        <TabsContent value="brand">
          <InterestBrandTab />
        </TabsContent>
        <TabsContent value="recent">
          <InterestRecentTab />
        </TabsContent>
      </Tabs>
    </section>
  );
}
