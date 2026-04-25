"use client";

import { cn, VStack } from "@seoul-moment/ui";

export default function SignupTerms() {
  return (
    <VStack className="w-full pt-[20px]" gap={10}>
      <p
        className={cn(
          "text-body-3 w-full text-center leading-none text-black/80",
          "max-md:text-body-4",
        )}
      >
        點擊註冊，即表示您已閱讀並同意 SEOUL MOMONET 之
      </p>
      <button
        className={cn(
          "text-body-3 w-full cursor-pointer text-center leading-none text-black/60 underline",
          "max-sm:text-body-4",
        )}
        type="button"
      >
        會員條款 與 客戶隱私權條款
      </button>
    </VStack>
  );
}
