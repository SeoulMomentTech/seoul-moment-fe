"use client";

import { useState } from "react";

import { cn, VStack } from "@seoul-moment/ui";
import { TermsModal } from "@widgets/terms-modal";

export function SignupTerms() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <VStack className="w-full pt-[20px]" gap={10}>
        <p
          className={cn(
            "text-body-3 w-full text-center leading-none text-black/80",
            "max-md:text-body-4",
          )}
        >
          點擊註冊,即表示您已閱讀並同意 SEOUL MOMONET 之
        </p>
        <button
          className={cn(
            "text-body-3 w-full cursor-pointer text-center leading-none text-black/60 underline",
            "max-sm:text-body-4",
          )}
          onClick={() => setOpen(true)}
          type="button"
        >
          會員條款 與 客戶隱私權條款
        </button>
      </VStack>

      <TermsModal onOpenChange={setOpen} open={open} title="Terms">
        <p className="text-body-3 leading-normal text-black/60">
          약관 내용입니다.
        </p>
      </TermsModal>
    </>
  );
}
