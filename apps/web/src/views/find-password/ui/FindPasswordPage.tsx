"use client";

import { useState } from "react";

import {
  FindPasswordHeader,
  RequestCodeForm,
  VerifyCodeForm,
} from "@features/find-password";
import { VStack } from "@seoul-moment/ui";

type Step = "request" | "verify";

export function FindPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [maskedAccount, setMaskedAccount] = useState<string | undefined>();

  const handleSent = (masked: string) => {
    setMaskedAccount(masked);
    setStep("verify");
  };

  return (
    <VStack className="w-full px-4 pb-[122px] pt-[136px] max-md:pb-[90px] max-md:pt-[136px]">
      <VStack className="w-full max-w-[414px]">
        <FindPasswordHeader maskedAccount={maskedAccount} step={step} />
        {step === "request" ? (
          <RequestCodeForm onSent={handleSent} />
        ) : (
          <VerifyCodeForm />
        )}
      </VStack>
    </VStack>
  );
}
