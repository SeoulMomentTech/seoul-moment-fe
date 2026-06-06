"use client";

import { useTranslations } from "next-intl";

import { cn, VStack } from "@seoul-moment/ui";

interface FindPasswordHeaderProps {
  className?: string;
}

export function FindPasswordHeader({ className }: FindPasswordHeaderProps) {
  const t = useTranslations();

  return (
    <VStack className={cn("w-full text-center", className)} gap={16}>
      <p className="text-title-3 font-semibold leading-none text-black">
        {t("forgot_password_1")}
      </p>
      <p className="text-body-3 leading-none text-black/60">
        {t("forgot_password_2")}
      </p>
    </VStack>
  );
}
