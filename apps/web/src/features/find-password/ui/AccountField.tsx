"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Button, HStack, Input } from "@seoul-moment/ui";

import { DEFAULT_COUNTRY_CODE, type FindPasswordMethod } from "../model/schema";

const INPUT_TYPE_BY_METHOD: Record<FindPasswordMethod, string> = {
  email: "text",
  phone: "tel",
};

interface AccountFieldProps {
  method: FindPasswordMethod;
  registerProps: UseFormRegisterReturn;
  buttonLabel: string;
  buttonDisabled: boolean;
  onRequest(): void;
}

export function AccountField({
  method,
  registerProps,
  buttonLabel,
  buttonDisabled,
  onRequest,
}: AccountFieldProps) {
  const t = useTranslations();
  const placeholder =
    method === "email" ? t("enter_your_email") : DEFAULT_COUNTRY_CODE;

  return (
    <HStack align="start" className="w-full" gap={8}>
      <Input
        className="text-body-2 flex-1 placeholder:text-black/20"
        placeholder={placeholder}
        type={INPUT_TYPE_BY_METHOD[method]}
        {...registerProps}
      />
      <Button
        className="text-body-2 h-auto w-[82px] shrink-0 rounded-[4px] px-[20px] py-[16px] font-semibold text-white"
        disabled={buttonDisabled}
        onClick={onRequest}
        type="button"
      >
        {buttonLabel}
      </Button>
    </HStack>
  );
}
