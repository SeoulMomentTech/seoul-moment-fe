"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

import { cn, Input, VStack } from "@seoul-moment/ui";

import { requestFormResolver, type RequestFormValues } from "../model/schema";

interface RequestCodeFormProps {
  onSent(maskedAccount: string): void;
}

function maskAccount(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes("@")) {
    const [local, domain] = trimmed.split("@");
    if (!local || !domain) return trimmed;
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}${"*".repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)}****${digits.slice(-4)}`;
  }
  return trimmed;
}

export function RequestCodeForm({ onSent }: RequestCodeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<RequestFormValues>({
    resolver: requestFormResolver,
    mode: "onChange",
    defaultValues: { account: "" },
  });

  const onSubmit: SubmitHandler<RequestFormValues> = ({ account }) => {
    // TODO: API 연동 — 인증코드 발송 요청
    onSent(maskAccount(account));
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[40px]" gap={16}>
        <Input
          className="max-sm:h-12"
          placeholder="請輸入手機號碼 或 Email"
          type="text"
          {...register("account")}
        />
      </VStack>

      <div className="w-full pt-[30px]">
        <button
          className={cn(
            "flex w-full cursor-pointer items-center justify-center rounded-[4px]",
            "bg-black px-[20px] py-[16px] font-semibold text-white",
            "disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/40",
            "max-md:h-12",
          )}
          disabled={!isValid}
          type="submit"
        >
          送出
        </button>
      </div>
    </form>
  );
}
