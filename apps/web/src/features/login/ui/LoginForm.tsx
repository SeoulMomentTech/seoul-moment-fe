"use client";

import { useTranslations } from "next-intl";

import { cn, HStack, Input, VStack } from "@seoul-moment/ui";

export default function LoginForm() {
  const t = useTranslations();

  return (
    <>
      <VStack className="w-full pt-[34px]" gap={14}>
        <Input
          className="max-sm:h-12"
          placeholder={t("請輸入手機號碼 或 Email")}
          type="text"
        />
        <HStack align="between" className="w-full">
          <label className="flex cursor-pointer items-center gap-[4px]">
            <input
              className={cn(
                "size-[14px] appearance-none rounded-full border border-black/40 bg-white",
                "checked:border-[4px] checked:border-black checked:bg-white",
              )}
              type="checkbox"
            />
            <span className="text-body-3 leading-none text-black">
              {t("記住帳號")}
            </span>
          </label>
          <button
            className="text-body-3 cursor-pointer leading-none text-black/60 underline"
            type="button"
          >
            {t("忘記密碼")}
          </button>
        </HStack>
      </VStack>

      <div className="w-full pt-[30px]">
        <button
          className={cn(
            "flex w-full cursor-pointer items-center justify-center rounded-[4px]",
            "bg-black px-[20px] py-[16px] font-semibold text-white",
            "max-md:h-12",
          )}
          type="button"
        >
          {t("로그인")}
        </button>
      </div>
    </>
  );
}
