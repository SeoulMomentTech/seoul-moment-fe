"use client";

import { useCallback, useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useGoogleSignupMutation } from "@features/login/api/useGoogleSignupMutation";
import { useLineSignupMutation } from "@features/login/api/useLineSignupMutation";
import {
  clearSnsSignupContext,
  isSnsSignupReady,
  readSnsSignupContext,
  saveSnsSignupContext,
  type SnsSignupContext,
} from "@features/login/lib/snsAuthStorage";
import { SnsLinkConfirmDialog } from "@features/login/ui/SnsLinkConfirmDialog";
import { useNicknameValidate } from "@shared/lib/hooks";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import { NICKNAME_MAX_LENGTH, sanitizeNickname } from "@shared/lib/nickname";
import type { PostSnsLoginResponse } from "@shared/services/auth";

import { useRouter } from "@/i18n/navigation";

import { cn, Flex, Input, VStack } from "@seoul-moment/ui";

import { MarketingConsent } from "./MarketingConsent";
import { SnsEmailVerification } from "./SnsEmailVerification";
import {
  snsSignupFormResolver,
  type SnsSignupFormValues,
} from "../model/snsSchema";

export function SnsSignupForm() {
  const t = useTranslations();
  const router = useRouter();
  const login = useUserAuthStore((s) => s.login);
  const [context, setContext] = useState<SnsSignupContext | null>(null);
  /**
   * 인증한 이메일에 이미 계정이 있어 연결 여부를 물어야 하는 상태.
   * login 응답의 needsLinkConfirm 과 같은 분기이며, 처리도 동일한 다이얼로그다.
   */
  const [linkPrompt, setLinkPrompt] = useState<{
    email: string;
    linkToken: string;
  } | null>(null);

  const handleSessionExpired = useCallback(() => {
    clearSnsSignupContext();
    toast.error(t("session_has_expired"));
    router.replace("/login");
  }, [router, t]);

  useEffect(() => {
    const stored = readSnsSignupContext();
    if (!stored) {
      handleSessionExpired();
      return;
    }
    // emailToken 을 내려주는 provider 는 LINE 뿐이다. 다른 provider 의
    // 이메일 대기 상태는 정상적으로 만들어질 수 없는 세션이다.
    if (!isSnsSignupReady(stored) && stored.provider !== "line") {
      handleSessionExpired();
      return;
    }
    setContext(stored);
  }, [handleSessionExpired]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<SnsSignupFormValues>({
    resolver: snsSignupFormResolver,
    mode: "onChange",
    defaultValues: {
      nickname: "",
      newProductAgreed: false,
      adAgreed: false,
      recommendAgreed: false,
    },
  });

  const nickname = watch("nickname");
  const newProductAgreed = watch("newProductAgreed");
  const adAgreed = watch("adAgreed");
  const recommendAgreed = watch("recommendAgreed");

  const { status: nicknameStatus, message: nicknameMessage } =
    useNicknameValidate({ nickname });

  const handleSignupSuccess = () => {
    clearSnsSignupContext();
    toast.success(t("registration_completed"), { position: "top-center" });
    router.replace("/login");
  };

  // 훅은 조건부로 호출할 수 없으므로 둘 다 생성하고 provider 로 골라 쓴다.
  const googleSignupMutation = useGoogleSignupMutation({
    onSuccess: handleSignupSuccess,
  });
  const lineSignupMutation = useLineSignupMutation({
    onSuccess: handleSignupSuccess,
  });
  const signupMutation =
    context?.provider === "line" ? lineSignupMutation : googleSignupMutation;

  const onSubmit: SubmitHandler<SnsSignupFormValues> = (values) => {
    // signupToken 이 없는 단계(이메일 인증 대기)에서는 제출할 수 없다. 빈 토큰을
    // 보내도 서버는 401 로만 답해, 사용자가 원인을 알 수 없는 실패가 된다.
    if (!context || !isSnsSignupReady(context)) return;
    signupMutation.mutate({
      signupToken: context.signupToken,
      nickname: values.nickname,
      newProductAgreed: values.newProductAgreed,
      adAgreed: values.adAgreed,
      recommendAgreed: values.recommendAgreed,
    });
  };

  if (!context) return null;

  const isReady = isSnsSignupReady(context);

  /**
   * 이메일 인증 성공. verify 응답은 login 과 같은 shape 이라 여기서 다시
   * 로그인 / 연결확인 / 신규가입으로 분기한다.
   *
   * 반환값은 "이 화면을 인증 완료 상태로 둘지" 다. 연결 확인처럼 다른 분기로
   * 넘어간 경우 인증 완료로 표시하면, 다이얼로그를 취소한 사용자가 진행할 수
   * 없는 완료 상태에 갇힌다.
   */
  const handleEmailVerified = (
    data: PostSnsLoginResponse,
    verifiedEmail: string,
  ) => {
    // 서버가 바로 로그인시킨 경우다. GuestOnly 가 홈으로 보낸다.
    if (data.token && data.refreshToken) {
      clearSnsSignupContext();
      login({ accessToken: data.token, refreshToken: data.refreshToken });
      return false;
    }

    // 인증한 이메일로 이미 가입된 계정이 있다. 신규 가입이 아니라 기존 계정에
    // SNS 를 연결하는 경로이므로, login 응답과 동일하게 연결 확인을 받는다.
    if (data.needsLinkConfirm && data.linkToken) {
      setLinkPrompt({
        email: data.email ?? verifiedEmail,
        linkToken: data.linkToken,
      });
      return false;
    }

    // 로그인도 연결도 가입도 아닌 응답은 진행할 수 있는 단계가 없다.
    if (!data.signupToken) {
      toast.error(t("verify_failed"));
      return false;
    }

    const next: SnsSignupContext = {
      provider: context.provider,
      signupToken: data.signupToken,
      email: data.email ?? verifiedEmail,
    };
    // 새로고침으로 인증을 되돌리지 않도록 즉시 저장한다.
    saveSnsSignupContext(next);
    setContext(next);
    return true;
  };

  // signupToken 을 확보한 상태(isReady)만 제출할 수 있다. 이메일 인증 통과를
  // 별도 플래그로 두면 토큰 없이 제출이 열려, 빈 토큰을 보내는 경로가 생긴다.
  const isSubmitDisabled =
    !isReady ||
    !isValid ||
    nicknameStatus !== "available" ||
    signupMutation.isPending;

  return (
    <>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <VStack className="w-full pt-[64px]" gap={16}>
          {isReady ? (
            // LINE 은 이메일을 주지 않을 수 있다. 없으면 계정 필드를 노출하지 않는다.
            context.email && (
              <Flex className="w-full" direction="column" gap={6}>
                <p className="text-body-3 leading-none text-black/60">
                  {t("account")}
                </p>
                <Input
                  className="bg-black/5 max-sm:h-12"
                  disabled
                  readOnly
                  value={context.email}
                />
              </Flex>
            )
          ) : (
            <SnsEmailVerification
              emailToken={context.emailToken}
              onExpired={handleSessionExpired}
              onVerified={handleEmailVerified}
            />
          )}

          <Flex className="w-full" direction="column" gap={6}>
            <p className="text-body-3 leading-none text-black/60">
              {t("nickname")}
            </p>
            <Input
              className="max-sm:h-12"
              maxLength={NICKNAME_MAX_LENGTH}
              placeholder={t("allowed_input")}
              type="text"
              {...register("nickname", {
                onChange: (e) =>
                  setValue("nickname", sanitizeNickname(e.target.value), {
                    shouldValidate: true,
                  }),
              })}
            />
            {nicknameMessage && (
              <span
                className={cn(
                  "text-body-4",
                  nicknameStatus === "available" ? "text-sent" : "text-error",
                )}
              >
                {nicknameMessage}
              </span>
            )}
          </Flex>
        </VStack>

        <MarketingConsent
          adAgreed={adAgreed}
          newProductAgreed={newProductAgreed}
          onChange={(key, next) =>
            setValue(key, next, { shouldValidate: true })
          }
          recommendAgreed={recommendAgreed}
        />

        <div className="w-full pt-[30px]">
          <button
            className={cn(
              "flex w-full cursor-pointer items-center justify-center rounded-[4px]",
              "bg-black px-[20px] py-[16px] font-semibold text-white",
              "disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/40",
              "max-md:h-12",
            )}
            disabled={isSubmitDisabled}
            type="submit"
          >
            {t("signup_complete")}
          </button>
        </div>
      </form>

      {linkPrompt && (
        <SnsLinkConfirmDialog
          email={linkPrompt.email}
          linkToken={linkPrompt.linkToken}
          onLinked={clearSnsSignupContext}
          onOpenChange={(open) => {
            if (!open) setLinkPrompt(null);
          }}
          open
          provider={context.provider}
        />
      )}
    </>
  );
}
