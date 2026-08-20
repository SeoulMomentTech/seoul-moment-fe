"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { useLineEmailCodeMutation } from "@features/login/api/useLineEmailCodeMutation";
import { useLineEmailVerifyMutation } from "@features/login/api/useLineEmailVerifyMutation";
import { isSnsTokenExpired } from "@features/login/lib/snsToken";
import type { PostSnsLoginResponse } from "@shared/services/auth";

import { Button, cn, Flex, HStack, Input, VStack } from "@seoul-moment/ui";

import { RESEND_INITIAL_SECONDS } from "../model/schema";
import {
  snsEmailFormResolver,
  type SnsEmailFormValues,
} from "../model/snsEmailSchema";

const ACTION_BUTTON_CLASS = cn(
  "text-body-3 h-[58.5px] shrink-0 rounded-[4px] py-[16px] font-semibold text-white",
  "max-sm:h-12 max-sm:py-0",
);

interface SnsEmailVerificationProps {
  /** login 응답으로 받은 단기 emailToken (10분) */
  emailToken: string;
  /**
   * 인증 성공. 응답은 login 과 같은 shape 이라 호출부가 연결(2-A) /
   * 가입(2-B) 으로 다시 분기해야 한다.
   */
  onVerified(data: PostSnsLoginResponse, email: string): void;
  /** emailToken 이 만료됐다. 처음부터 다시 인증해야 한다. */
  onExpired(): void;
}

/**
 * provider 가 이메일을 주지 않은 경우 가입 화면에서 이메일을 직접 입력받아
 * 인증한다. emailToken 을 발급하는 provider 는 현재 LINE 뿐이다.
 */
export function SnsEmailVerification({
  emailToken,
  onVerified,
  onExpired,
}: SnsEmailVerificationProps) {
  const t = useTranslations();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = setInterval(
      () => setResendSeconds((seconds) => seconds - 1),
      1000,
    );
    return () => clearInterval(id);
  }, [resendSeconds]);

  const { register, watch, trigger, setValue } = useForm<SnsEmailFormValues>({
    resolver: snsEmailFormResolver,
    mode: "onChange",
    defaultValues: { email: "", verificationCode: "" },
  });

  const email = watch("email");
  const verificationCode = watch("verificationCode");

  const emailCodeMutation = useLineEmailCodeMutation({
    onSuccess: () => {
      setIsCodeSent(true);
      setResendSeconds(RESEND_INITIAL_SECONDS);
    },
    // 이 엔드포인트의 401 은 emailToken 만료·변조 뿐이다.
    onError: (error) => {
      if (error.response.status === 401) onExpired();
    },
  });

  const emailVerifyMutation = useLineEmailVerifyMutation({
    onSuccess: (data) => {
      setVerifyError(null);
      setIsVerified(true);
      onVerified(data, email);
    },
    // 만료는 요청 전에 걸러내므로 여기 401 은 코드 불일치로 본다.
    onError: () => {
      setIsVerified(false);
      setVerifyError(t("code_not_match"));
    },
  });

  /** 만료된 토큰으로는 어떤 요청도 통과하지 못한다. */
  const guardExpiry = () => {
    if (!isSnsTokenExpired(emailToken)) return false;
    onExpired();
    return true;
  };

  const handleSendCode = async () => {
    if (guardExpiry()) return;

    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    setVerifyError(null);
    setIsVerified(false);
    setValue("verificationCode", "", { shouldValidate: true });
    emailCodeMutation.mutate({ emailToken, email });
  };

  const handleVerifyCode = () => {
    if (guardExpiry()) return;
    if (!verificationCode) return;

    emailVerifyMutation.mutate({ emailToken, email, code: verificationCode });
  };

  const isResendDisabled =
    !email || emailCodeMutation.isPending || resendSeconds > 0;
  const sendButtonLabel = isCodeSent
    ? resendSeconds > 0
      ? `${t("resend")} (${resendSeconds}s)`
      : t("resend")
    : t("send_verification_code");

  return (
    <VStack className="w-full" gap={16}>
      <Input
        className="max-sm:h-12"
        placeholder={t("enter_email")}
        type="email"
        {...register("email", {
          onChange: () => {
            // 이메일이 바뀌면 이전 이메일로 받은 코드는 의미가 없다.
            if (isCodeSent) setIsCodeSent(false);
            if (isVerified) setIsVerified(false);
            if (verifyError) setVerifyError(null);
          },
        })}
      />

      <Flex className="w-full" direction="column" gap={6}>
        <HStack className="w-full" gap={8}>
          <Input
            className="flex-1 max-sm:h-12"
            disabled={isVerified}
            inputMode="numeric"
            placeholder={t("enter_code")}
            type="text"
            {...register("verificationCode", {
              onChange: () => {
                if (isVerified) setIsVerified(false);
                if (verifyError) setVerifyError(null);
              },
            })}
          />
          <Button
            className={ACTION_BUTTON_CLASS}
            disabled={isResendDisabled}
            onClick={handleSendCode}
            type="button"
          >
            {sendButtonLabel}
          </Button>
          {isCodeSent && (
            <Button
              className={ACTION_BUTTON_CLASS}
              disabled={
                !verificationCode || isVerified || emailVerifyMutation.isPending
              }
              onClick={handleVerifyCode}
              type="button"
            >
              {isVerified ? t("verification_success_full") : t("confirm")}
            </Button>
          )}
        </HStack>

        {isCodeSent && !isVerified && !verifyError && (
          <span className="text-body-4 text-black/60">
            {t("code_sent_email")}
          </span>
        )}
        {verifyError && (
          <span className="text-body-4 text-error">{verifyError}</span>
        )}
        {isVerified && (
          <span className="text-body-4 text-sent">
            {t("email_verification_completed")}
          </span>
        )}
      </Flex>
    </VStack>
  );
}
