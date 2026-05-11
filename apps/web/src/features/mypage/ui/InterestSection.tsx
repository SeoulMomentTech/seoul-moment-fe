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
  "h-auto flex-none rounded-none border-b-2 border-transparent bg-transparent px-0 pb-[16px] pt-[12px] text-[16px] data-[state=active]:border-b-black";

export function InterestSection({ className }: InterestSectionProps) {
  const { tab, setTab } = useMyPageTab();

  return (
    <section className={cn("flex flex-col gap-5", className)}>
      <h2 className="text-title-3 font-bold text-black">관심</h2>

      <Tabs
        className="gap-6"
        onValueChange={(v) => setTab(v as MyPageTab)}
        value={tab}
      >
        <TabsList className="h-auto w-full justify-start gap-[30px] rounded-none border-b border-b-black/10 bg-transparent p-0">
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
