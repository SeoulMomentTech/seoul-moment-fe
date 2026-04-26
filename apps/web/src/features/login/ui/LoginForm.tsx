"use client";

import { Link } from "@/i18n/navigation";

import { cn, HStack, Input, VStack } from "@seoul-moment/ui";

export default function LoginForm() {
  return (
    <>
      <VStack className="w-full pt-[34px]" gap={14}>
        <Input
          className="max-sm:h-12"
          placeholder="請輸入手機號碼 或 Email"
          type="text"
        />
        <HStack align="end" className="w-full">
          <Link
            className="text-body-3 cursor-pointer leading-none text-black/60 underline"
            href="/find-password"
          >
            忘記密碼
          </Link>
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
          로그인
        </button>
      </div>
    </>
  );
}
