"use client";

import { VStack } from "@seoul-moment/ui";

interface FindPasswordHeaderProps {
  step: "request" | "verify";
  maskedAccount?: string;
}

export default function FindPasswordHeader({
  step,
  maskedAccount,
}: FindPasswordHeaderProps) {
  if (step === "request") {
    return (
      <VStack className="w-full text-center" gap={16}>
        <p className="text-title-3 font-semibold leading-none text-black">
          忘記密碼
        </p>
        <p className="text-body-3 leading-none text-black/60">
          別擔心！讓我們協助您重新設定
        </p>
      </VStack>
    );
  }

  return (
    <VStack className="w-full text-center" gap={16}>
      <p className="text-title-3 font-semibold leading-none text-black">
        인증코드 입력
      </p>
      <VStack className="w-full" gap={10}>
        <p className="text-body-3 leading-none text-black/60">
          인증코드를 회원님의 휴대폰 번호로 발송했습니다.
        </p>
        {maskedAccount ? (
          <p className="text-body-3 leading-none text-black/60">
            {maskedAccount}
          </p>
        ) : null}
      </VStack>
    </VStack>
  );
}
