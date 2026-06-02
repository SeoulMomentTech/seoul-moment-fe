"use client";

import { useTranslations } from "next-intl";

import { VStack } from "@seoul-moment/ui";

export function SignupHeader() {
  const t = useTranslations();

  return (
    <VStack className="w-full">
      <h1 className="text-title-3 text-center font-semibold leading-none text-black">
        {t("sign_up")}
      </h1>
    </VStack>
  );
}
