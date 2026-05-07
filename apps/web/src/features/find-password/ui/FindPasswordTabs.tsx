"use client";

import { cn, Tabs, TabsList, TabsTrigger } from "@seoul-moment/ui";

export type FindPasswordMethod = "email" | "phone";

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
          이메일
        </TabsTrigger>
        <TabsTrigger
          className="text-body-2 flex-1 rounded-none px-0 pb-[20px] pt-[12px]"
          value="phone"
        >
          휴대폰번호
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
