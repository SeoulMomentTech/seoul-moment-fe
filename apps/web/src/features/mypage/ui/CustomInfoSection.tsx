"use client";

import { cn } from "@shared/lib/style";

import { CustomInfoForm } from "./CustomInfoForm";

interface CustomInfoSectionProps {
  className?: string;
}

export function CustomInfoSection({ className }: CustomInfoSectionProps) {
  return (
    <section
      className={cn(
        "flex w-[598px] flex-col gap-10 max-sm:w-full max-sm:gap-8",
        className,
      )}
    >
      <h2 className="text-title-4 sm:text-title-3 font-bold text-black">
        나의 맞춤 정보
      </h2>

      <CustomInfoForm
        heightLabel="키"
        submitLabel="저장하기"
        weightLabel="몸무게"
      />
    </section>
  );
}
