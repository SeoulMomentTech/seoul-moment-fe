"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/style";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function Collaborators() {
  const [filter, setFilter] = useState("beauty");

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
            defaultValue={filter}
            onValueChange={setFilter}
          >
            <TabsList className="flex h-[50px] items-center gap-[30px]">
              <TabsTrigger className="text-[18px]" value="beauty">
                뷰티
              </TabsTrigger>
              <TabsTrigger className="text-[18px]" value="fashion">
                패션
              </TabsTrigger>
              <TabsTrigger className="text-[18px]" value="logistics">
                로지스틱스
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="max-sm:px-[20px]" />
        </div>
      </div>
    </section>
  );
}
