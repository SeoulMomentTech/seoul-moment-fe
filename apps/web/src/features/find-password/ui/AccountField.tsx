"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";

import { TAIWAN_DIAL_CODE } from "@shared/lib/utils";

import { Button, cn, HStack, Input } from "@seoul-moment/ui";

import { type FindPasswordMethod } from "../model/schema";

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

  return (
    <HStack align="start" className="w-full" gap={8}>
      {method === "email" ? (
        <Input
          className="text-body-2 flex-1 placeholder:text-black/20"
          placeholder={t("enter_your_email")}
          type="text"
          {...registerProps}
        />
      ) : (
        <HStack
          align="center"
          className={cn(
            "h-auto flex-1 rounded-[4px] border border-black/20 bg-white",
            "px-[12px] py-[16px]",
            "focus-within:border-foreground",
          )}
          gap={8}
        >
          <span className="text-body-2 text-foreground shrink-0 leading-none">
            {TAIWAN_DIAL_CODE}
          </span>
          <input
            className={cn(
              "text-body-2 text-foreground placeholder:text-black/20",
              "min-w-0 flex-1 bg-transparent leading-none outline-none",
            )}
            inputMode="numeric"
            placeholder="912345678"
            type="tel"
            {...registerProps}
          />
        </HStack>
      )}
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
