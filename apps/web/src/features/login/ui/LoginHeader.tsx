"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { VStack } from "@seoul-moment/ui";

export function LoginHeader() {
  const t = useTranslations();

  return (
    <VStack gap={16}>
      <Image
        alt="Seoul Moment"
        height={24}
        preload
        src="/logo.png"
        width={204}
      />
      <p className="text-body-3 text-center leading-none text-black/60">
        {t("welcome_to_seoulmoment")}
      </p>
    </VStack>
  );
}
