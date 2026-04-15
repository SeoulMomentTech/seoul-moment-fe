"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button, cn, VStack } from "@seoul-moment/ui";

export default function SocialLoginButtons() {
  const t = useTranslations();

  return (
    <VStack className="w-full pt-[38px] max-md:pt-[120px]" gap={8}>
      <Button
        className={cn(
          "flex h-12 w-full cursor-pointer items-center gap-[4px] rounded-[4px] border border-black/20 bg-white px-[20px] py-[12px]",
          "relative",
        )}
        type="button"
        variant="outline"
      >
        <Image
          alt=""
          className="absolute left-[20px]"
          height={24}
          src="/login/google.svg"
          width={24}
        />
        <span className="flex-1 text-center font-semibold text-black">
          {t("구글로 로그인")}
        </span>
      </Button>
      <Button
        className={cn(
          "flex h-12 w-full cursor-pointer items-center gap-[4px] rounded-[4px] border border-black/20 bg-white px-[20px] py-[12px]",
          "relative",
        )}
        type="button"
        variant="outline"
      >
        <Image
          alt=""
          className="absolute left-[20px]"
          height={24}
          src="/login/line.png"
          width={24}
        />
        <span className="flex-1 text-center font-semibold text-black">
          {t("라인으로 로그인")}
        </span>
      </Button>
    </VStack>
  );
}
