"use client";

import { cn, VStack } from "@seoul-moment/ui";

interface FindPasswordHeaderProps {
  className?: string;
}

export function FindPasswordHeader({ className }: FindPasswordHeaderProps) {
  return (
    <VStack className={cn("w-full text-center", className)} gap={16}>
      <p className="text-title-3 font-semibold leading-none text-black">
        忘記密碼
      </p>
      <p className="text-body-3 leading-none text-black/60">
        別擔心！讓我們協助您重新設定
      </p>
    </VStack>
  );
}
