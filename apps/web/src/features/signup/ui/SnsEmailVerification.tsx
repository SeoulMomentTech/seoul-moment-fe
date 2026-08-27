"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { useLineEmailCodeMutation } from "@features/login/api/useLineEmailCodeMutation";
import { useLineEmailVerifyMutation } from "@features/login/api/useLineEmailVerifyMutation";
import { isSnsTokenExpired } from "@features/login/lib/snsToken";
import type { PostSnsLoginResponse } from "@shared/services/auth";

import { getErrorInfo } from "@/shared/lib/utils/error";

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

/**
 * 이메일 인증 화면이 가질 수 있는 상태. 서로 배타적이라 "인증 성공인데 오류
 * 문구도 있는" 조합이 만들어질 수 없다.
 *
 * 인증 통과 상태가 없는 것은 의도다. 통과하면 호출부가 context 를 ready 로
 * 바꿔 이 화면 자체를 계정 필드로 교체하므로, 완료 표시는 도달할 수 없다.
 */
type EmailVerifyPhase =
  | { phase: "editing" } // 코드 미발송
  | { phase: "awaitingCode" } // 발송 완료, 코드 입력 대기
  | { phase: "rejected"; message: string };

const EDITING: EmailVerifyPhase = { phase: "editing" };

interface SnsEmailVerificationProps {
  /** login 응답으로 받은 단기 emailToken (10분) */
  emailToken: string;
  /**
   * 인증 성공. 응답은 login 과 같은 shape 이라 호출부가 연결(2-A) /
   * 가입(2-B) 으로 다시 분기한다. 가입으로 넘어가면 호출부가 context 를
   * 갱신해 이 화면을 언마운트하므로, 이 컴포넌트는 결과를 따로 기록하지 않는다.
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
  const [verify, setVerify] = useState<EmailVerifyPhase>(EDITING);
  // 재전송 카운트다운은 인증 단계와 직교하는 축이라 따로 둔다.
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

  /** 코드를 다시 입력·재발송하면 이전 시도의 실패 문구는 의미가 없다. */
  const clearRejection = () =>
    setVerify((current) =>
      current.phase === "rejected" ? { phase: "awaitingCode" } : current,
    );

  const emailCodeMutation = useLineEmailCodeMutation({
    onSuccess: () => {
      setVerify({ phase: "awaitingCode" });
      setResendSeconds(RESEND_INITIAL_SECONDS);
    },
    // 이 엔드포인트의 401 은 emailToken 만료·변조 뿐이다.
    // 타임아웃·네트워크 오류에는 response 가 없으므로 직접 접근하지 않는다.
    onError: (error) => {
      if (getErrorInfo(error).status === 401) onExpired();
    },
  });

  const emailVerifyMutation = useLineEmailVerifyMutation({
    onSuccess: (data) => onVerified(data, email),
    onError: (err) => {
      // 만료는 guardExpiry 가 요청 전에 걸러내므로 401 은 코드 불일치로 본다.
      // 500·네트워크 오류까지 코드 불일치로 표시하면 사용자가 올바른 코드를
      // 계속 다시 입력하게 되므로 일반 실패 문구로 구분한다.
      const { status } = getErrorInfo(err);
      setVerify({
        phase: "rejected",
        message: status === 401 ? t("code_not_match") : t("verify_failed"),
      });
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

    clearRejection();
    setValue("verificationCode", "", { shouldValidate: true });
    emailCodeMutation.mutate({ emailToken, email });
  };

  const handleVerifyCode = () => {
    if (guardExpiry()) return;
    if (!verificationCode) return;

    emailVerifyMutation.mutate({ emailToken, email, code: verificationCode });
  };

  const isCodeSent = verify.phase !== "editing";
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
          // 이메일이 바뀌면 이전 이메일로 받은 코드는 의미가 없다.
          onChange: () => setVerify(EDITING),
        })}
      />

      <Flex className="w-full" direction="column" gap={6}>
        <HStack className="w-full" gap={8}>
          <Input
            className="flex-1 max-sm:h-12"
            inputMode="numeric"
            placeholder={t("enter_code")}
            type="text"
            {...register("verificationCode", { onChange: clearRejection })}
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
              disabled={!verificationCode || emailVerifyMutation.isPending}
              onClick={handleVerifyCode}
              type="button"
            >
              {t("confirm")}
            </Button>
          )}
        </HStack>

        {verify.phase === "awaitingCode" && (
          <span className="text-body-4 text-black/60">
            {t("code_sent_email")}
          </span>
        )}
        {verify.phase === "rejected" && (
          <span className="text-body-4 text-error">{verify.message}</span>
        )}
      </Flex>
    </VStack>
  );
}
