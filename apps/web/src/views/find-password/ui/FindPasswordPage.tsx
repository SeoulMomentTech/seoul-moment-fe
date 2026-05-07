"use client";

import { useState } from "react";

import GuestOnly from "@shared/lib/components/GuestOnly";

import {
  type FindPasswordMethod,
  FindPasswordHeader,
  FindPasswordTabs,
  VerificationForm,
} from "@features/find-password";

const REQUEST_DESCRIPTION_BY_METHOD: Record<FindPasswordMethod, string> = {
  email: "가입했던 이메일을 기입해주세요.",
  phone: "가입했던 휴대전화 번호를 기입해주세요.",
};

export function FindPasswordPage() {
  const [method, setMethod] = useState<FindPasswordMethod>("email");

  const handleVerified = (_maskedAccount: string) => {
    // TODO: 비밀번호 재설정 단계로 이동
    console.log(_maskedAccount);
  };

  return (
    <GuestOnly>
      <div className="max-sm:min-w-auto min-w-[1280px]">
        <div className="max:max-w-none mx-auto flex w-[414px] flex-col pb-[122px] pt-[136px] max-sm:w-auto max-sm:px-0 max-sm:pb-[90px] max-sm:pt-[56px]">
          <FindPasswordHeader className="max-sm:order-2 max-sm:mt-[42px] max-sm:px-4 md:order-1" />
          <FindPasswordTabs
            className="max-sm:order-1 md:order-2 md:mt-[34px]"
            onValueChange={setMethod}
            value={method}
          />
          <p className="text-body-3 order-3 mt-[38px] text-center font-medium leading-none text-black/80 max-sm:hidden">
            {REQUEST_DESCRIPTION_BY_METHOD[method]}
          </p>
          <div className="order-4 mt-[30px] max-sm:mt-[38px] max-sm:px-4">
            <VerificationForm
              key={method}
              method={method}
              onVerified={handleVerified}
            />
          </div>
        </div>
      </div>
    </GuestOnly>
  );
}
