"use client";

import { useTranslations } from "next-intl";

import { SnsSignupForm } from "@features/signup/ui/SnsSignupForm";
import GuestOnly from "@shared/lib/components/GuestOnly";

import { VStack } from "@seoul-moment/ui";

export function SnsSignupPage() {
  const t = useTranslations();

  return (
    <GuestOnly>
      <VStack className="w-full px-4 pb-[122px] pt-[136px] max-md:pb-[50px] max-md:pt-[106px]">
        <VStack className="w-full max-w-[414px]">
          <h1 className="text-title-3 w-full font-semibold leading-tight">
            {t("signup_with_sns")}
          </h1>
          <p className="text-body-3 w-full pt-[12px] leading-normal text-black/60">
            {t("enter_your_nickname")}
          </p>
          <SnsSignupForm />
        </VStack>
      </VStack>
    </GuestOnly>
  );
}
