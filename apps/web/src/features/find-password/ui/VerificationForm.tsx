"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { Button, cn, VStack } from "@seoul-moment/ui";

import { AccountField } from "./AccountField";
import { VerifyCodeField } from "./VerifyCodeField";
import { usePostPasswordEmailCodeMutation } from "../api/usePostPasswordEmailCodeMutation";
import { usePostPasswordEmailVerifyMutation } from "../api/usePostPasswordEmailVerifyMutation";
import { usePostPasswordPhoneCodeMutation } from "../api/usePostPasswordPhoneCodeMutation";
import { usePostPasswordPhoneVerifyMutation } from "../api/usePostPasswordPhoneVerifyMutation";
import { maskAccount } from "../model/maskAccount";
import {
  getVerificationMessage,
  type VerificationStatus,
} from "../model/messages";
import {
  type FindPasswordMethod,
  PHONE_CODE_DURATION_SECONDS,
  type VerificationFormValues,
  verificationFormResolver,
} from "../model/schema";
import { useCountdown } from "../model/useCountdown";

interface VerificationFormProps {
  method: FindPasswordMethod;
  onVerified(payload: { maskedAccount: string; token: string }): void;
}

export function VerificationForm({
  method,
  onVerified,
}: VerificationFormProps) {
  const t = useTranslations();
  const { register, watch } = useForm<VerificationFormValues>({
    resolver: verificationFormResolver,
    mode: "onChange",
    defaultValues: { account: "", verifyCode: "" },
  });

  const account = watch("account");
  const verifyCode = watch("verifyCode");

  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [resetToken, setResetToken] = useState<string | null>(null);

  const {
    secondsLeft,
    isCounting,
    start: startCountdown,
  } = useCountdown(PHONE_CODE_DURATION_SECONDS, () => {
    setStatus((current) => (current === "sent" ? "expired" : current));
  });

  const postEmailCodeMutation = usePostPasswordEmailCodeMutation({
    onSuccess: () => {
      setStatus("sent");
      startCountdown();
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

  const postPhoneCodeMutation = usePostPasswordPhoneCodeMutation({
    onSuccess: () => {
      setStatus("sent");
      startCountdown();
    },
  });

  const verifyPhoneCodeMutation = usePostPasswordPhoneVerifyMutation({
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
    postPhoneCodeMutation.mutate(account.trim());
  };

  const handleVerify = () => {
    if (method === "email") {
      verifyEmailCodeMutation.mutate({
        email: account.trim(),
        code: verifyCode,
      });
      return;
    }
    verifyPhoneCodeMutation.mutate({
      phone: account.trim(),
      code: verifyCode,
    });
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
    method === "email"
      ? postEmailCodeMutation.isPending
      : postPhoneCodeMutation.isPending;
  const isVerifyingCode =
    method === "email"
      ? verifyEmailCodeMutation.isPending
      : verifyPhoneCodeMutation.isPending;
  const canVerify =
    isCodeSent && !!verifyCode && !isVerified && !isVerifyingCode;
  const requestButtonLabel = isCodeSent ? t("resend_2") : t("verification");
  const requestButtonDisabled =
    isVerified ||
    isRequestingCode ||
    (isCodeSent ? isCounting : !canRequestCode);
  const message = getVerificationMessage(status, method);

  return (
    <form className="w-full" onSubmit={(e) => e.preventDefault()}>
      <VStack className="w-full" gap={40}>
        <VStack className="w-full" gap={20}>
          <AccountField
            buttonDisabled={requestButtonDisabled}
            buttonLabel={requestButtonLabel}
            method={method}
            onRequest={handleRequestCode}
            registerProps={register("account")}
          />

          <VStack className="w-full" gap={8}>
            <VerifyCodeField
              buttonDisabled={!canVerify}
              isCounting={isCounting}
              onVerify={handleVerify}
              registerProps={register("verifyCode")}
              secondsLeft={secondsLeft}
            />
            {message ? (
              <p
                className={cn(
                  "text-body-3 w-full leading-none",
                  message.tone === "info" && "text-info",
                  message.tone === "error" && "text-error",
                )}
              >
                {message.textKey ? t(message.textKey) : message.text}
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
          {t("confirm")}
        </Button>
      </VStack>
    </form>
  );
}
