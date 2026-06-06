"use client";

import { useTranslations } from "next-intl";

import { cn, Tabs, TabsList, TabsTrigger } from "@seoul-moment/ui";

import type { FindPasswordMethod } from "../model/schema";

export type { FindPasswordMethod };

interface FindPasswordTabsProps {
  value: FindPasswordMethod;
  onValueChange(value: FindPasswordMethod): void;
  className?: string;
}

export function FindPasswordTabs({
  value,
  onValueChange,
  className,
}: FindPasswordTabsProps) {
  const t = useTranslations();

  return (
    <Tabs
      className={cn("w-full gap-0 border-b border-b-black/10", className)}
      onValueChange={(next) => onValueChange(next as FindPasswordMethod)}
      value={value}
    >
      <TabsList className="h-auto w-full rounded-none bg-transparent p-0">
        <TabsTrigger
          className="text-body-2 flex-1 rounded-none px-0 pb-[20px] pt-[12px]"
          value="email"
        >
          {t("email")}
        </TabsTrigger>
        <TabsTrigger
          className="text-body-2 flex-1 rounded-none px-0 pb-[20px] pt-[12px]"
          value="phone"
        >
          {t("mobile_number")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
