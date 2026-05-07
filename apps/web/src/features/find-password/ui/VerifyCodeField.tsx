"use client";

import type { UseFormRegisterReturn } from "react-hook-form";

import { Button, HStack } from "@seoul-moment/ui";

import { formatTimer } from "../model/formatTimer";

interface VerifyCodeFieldProps {
  registerProps: UseFormRegisterReturn;
  isCounting: boolean;
  secondsLeft: number;
  buttonDisabled: boolean;
  onVerify(): void;
}

export function VerifyCodeField({
  registerProps,
  isCounting,
  secondsLeft,
  buttonDisabled,
  onVerify,
}: VerifyCodeFieldProps) {
  return (
    <HStack align="start" className="w-full" gap={8}>
      <div className="flex flex-1 items-center gap-2 rounded-[4px] border border-black/20 bg-white px-[12px] py-[16px]">
        <input
          className="text-body-2 min-w-0 flex-1 outline-none placeholder:text-black/20"
          inputMode="numeric"
          placeholder="인증번호"
          type="text"
          {...registerProps}
        />
        {isCounting ? (
          <span className="text-body-3 shrink-0 text-black/20">
            {formatTimer(secondsLeft)}
          </span>
        ) : null}
      </div>
      <Button
        className="text-body-2 h-auto w-[82px] shrink-0 rounded-[4px] px-[20px] py-[16px] font-semibold text-white"
        disabled={buttonDisabled}
        onClick={onVerify}
        type="button"
      >
        확인
      </Button>
    </HStack>
  );
}
