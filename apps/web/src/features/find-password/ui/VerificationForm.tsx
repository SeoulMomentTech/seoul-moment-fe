"use client";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { Button, cn, HStack, Input, VStack } from "@seoul-moment/ui";

import type { FindPasswordMethod } from "./FindPasswordTabs";
import { usePostPasswordEmailCodeMutation } from "../api/usePostPasswordEmailCodeMutation";
import { usePostPasswordEmailVerifyMutation } from "../api/usePostPasswordEmailVerifyMutation";
import {
  DEFAULT_COUNTRY_CODE,
  PHONE_CODE_DURATION_SECONDS,
  type VerificationFormValues,
  verificationFormResolver,
} from "../model/schema";

type Status = "idle" | "sent" | "expired" | "verified" | "failed";

type MessageTone = "info" | "error";

interface VerificationFormProps {
  method: FindPasswordMethod;
  onVerified(payload: { maskedAccount: string; token: string }): void;
}

const ACCOUNT_PLACEHOLDER_BY_METHOD: Record<FindPasswordMethod, string> = {
  email: "請輸入手機號碼 或 Email",
  phone: DEFAULT_COUNTRY_CODE,
};

const ACCOUNT_INPUT_TYPE_BY_METHOD: Record<FindPasswordMethod, string> = {
  email: "text",
  phone: "tel",
};

const VERIFIED_MESSAGE_BY_METHOD: Record<FindPasswordMethod, string> = {
  email: "Email verified successfully.",
  phone: "Phone number verified successfully.",
};

function getMessage(
  status: Status,
  method: FindPasswordMethod,
): { text: string; tone: MessageTone } | null {
  switch (status) {
    case "sent":
      return { text: "Verification code has been sent.", tone: "info" };
    case "verified":
      return { text: VERIFIED_MESSAGE_BY_METHOD[method], tone: "info" };
    case "failed":
      return { text: "Code is incorrect, Please check again..", tone: "error" };
    case "expired":
      return { text: "Expired. Try again.", tone: "error" };
    default:
      return null;
  }
}

function formatTimer(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function maskAccount(value: string, method: FindPasswordMethod): string {
  const trimmed = value.trim();
  if (method === "email") {
    if (!trimmed.includes("@")) return trimmed;
    const [local, domain] = trimmed.split("@");
    if (!local || !domain) return trimmed;
    const visible = local.slice(0, Math.min(2, local.length));
    return `${visible}${"*".repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8) return trimmed;
  return `${digits.slice(0, 4)}****${digits.slice(-4)}`;
}

export function VerificationForm({
  method,
  onVerified,
}: VerificationFormProps) {
  const { register, watch } = useForm<VerificationFormValues>({
    resolver: verificationFormResolver,
    mode: "onChange",
    defaultValues: { account: "", verifyCode: "" },
  });

  const account = watch("account");
  const verifyCode = watch("verifyCode");

  const [status, setStatus] = useState<Status>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const isCounting = status === "sent" && secondsLeft > 0;

  useEffect(() => {
    if (!isCounting) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [isCounting, secondsLeft]);

  useEffect(() => {
    if (status === "sent" && secondsLeft <= 0) {
      setStatus("expired");
    }
  }, [status, secondsLeft]);

  const [resetToken, setResetToken] = useState<string | null>(null);

  const postEmailCodeMutation = usePostPasswordEmailCodeMutation({
    onSuccess: () => {
      setStatus("sent");
      setSecondsLeft(PHONE_CODE_DURATION_SECONDS);
    },
  });

  const verifyEmailCodeMutation = usePostPasswordEmailVerifyMutation({
    onSuccess: (token) => {
      setResetToken(token);
      setStatus("verified");
    },
    onError: () => {
      setStatus("failed");
    },
  });

  const handleRequestCode = () => {
    if (method === "email") {
      postEmailCodeMutation.mutate(account.trim());
      return;
    }
    // TODO: 폰 인증 API 연동 (현재 mock)
    setStatus("sent");
    setSecondsLeft(PHONE_CODE_DURATION_SECONDS);
  };

  const handleVerify = () => {
    if (method === "email") {
      verifyEmailCodeMutation.mutate({
        email: account.trim(),
        code: verifyCode,
      });
      return;
    }
    // TODO: 폰 인증 API 연동 (현재 mock)
    if (verifyCode === "123456") {
      setResetToken("mock-phone-token");
      setStatus("verified");
    } else {
      setStatus("failed");
    }
  };

  const handleProceed = () => {
    if (!resetToken) return;
    onVerified({
      maskedAccount: maskAccount(account, method),
      token: resetToken,
    });
  };

  const canRequestCode = account.trim().length > 0;
  const isCodeSent = status !== "idle";
  const isVerified = status === "verified";
  const isRequestingCode =
    method === "email" && postEmailCodeMutation.isPending;
  const isVerifyingCode =
    method === "email" && verifyEmailCodeMutation.isPending;
  const canVerify =
    isCodeSent && !!verifyCode && !isVerified && !isVerifyingCode;
  const requestButtonLabel = isCodeSent ? "재전송" : "인증";
  const requestButtonDisabled =
    isVerified ||
    isRequestingCode ||
    (isCodeSent ? isCounting : !canRequestCode);
  const message = getMessage(status, method);

  return (
    <form className="w-full" onSubmit={(e) => e.preventDefault()}>
      <VStack className="w-full" gap={40}>
        <VStack className="w-full" gap={20}>
          <HStack align="start" className="w-full" gap={8}>
            <Input
              className="text-body-2 flex-1 placeholder:text-black/20"
              placeholder={ACCOUNT_PLACEHOLDER_BY_METHOD[method]}
              type={ACCOUNT_INPUT_TYPE_BY_METHOD[method]}
              {...register("account")}
            />
            <Button
              className="text-body-2 h-auto w-[82px] shrink-0 rounded-[4px] px-[20px] py-[16px] font-semibold text-white"
              disabled={requestButtonDisabled}
              onClick={handleRequestCode}
              type="button"
            >
              {requestButtonLabel}
            </Button>
          </HStack>

          <VStack className="w-full" gap={8}>
            <HStack align="start" className="w-full" gap={8}>
              <div className="flex flex-1 items-center gap-2 rounded-[4px] border border-black/20 bg-white px-[12px] py-[16px]">
                <input
                  className="text-body-2 min-w-0 flex-1 outline-none placeholder:text-black/20"
                  inputMode="numeric"
                  placeholder="인증번호"
                  type="text"
                  {...register("verifyCode")}
                />
                {isCounting ? (
                  <span className="text-body-3 shrink-0 text-black/20">
                    {formatTimer(secondsLeft)}
                  </span>
                ) : null}
              </div>
              <Button
                className="text-body-2 h-auto w-[82px] shrink-0 rounded-[4px] px-[20px] py-[16px] font-semibold text-white"
                disabled={!canVerify}
                onClick={handleVerify}
                type="button"
              >
                확인
              </Button>
            </HStack>
            {message ? (
              <p
                className={cn(
                  "text-body-3 w-full leading-none",
                  message.tone === "info" && "text-info",
                  message.tone === "error" && "text-error",
                )}
              >
                {message.text}
              </p>
            ) : null}
          </VStack>
        </VStack>

        <Button
          className="text-body-2 h-auto w-full rounded-[4px] px-[20px] py-[16px] font-semibold text-white"
          disabled={!isVerified}
          onClick={handleProceed}
          type="button"
        >
          확인
        </Button>
      </VStack>
    </form>
  );
}
