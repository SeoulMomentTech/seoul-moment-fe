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
   * 이메일 인증을 통과했는지. 인증한 이메일에 계정이 있든 없든 인증 자체는
   * 진행되며, 가입 가능 여부는 제출 후 서버 응답으로 판정한다.
   */
  const [isEmailVerified, setIsEmailVerified] = useState(false);

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
    if (!context) return;
    signupMutation.mutate({
      // 인증 단계에서 받은 토큰을 그대로 보낸다. 이미 가입된 이메일인지는
      // 서버가 이 요청의 응답으로 판정한다. 인증은 통과했지만 서버가
      // signupToken 을 주지 않은 경우도 그대로 보내 응답으로 판정한다.
      signupToken: isSnsSignupReady(context) ? context.signupToken : "",
      nickname: values.nickname,
      newProductAgreed: values.newProductAgreed,
      adAgreed: values.adAgreed,
      recommendAgreed: values.recommendAgreed,
    });
  };

  if (!context) return null;

  const isReady = isSnsSignupReady(context);

  /**
   * 이메일 인증 성공. 인증한 이메일에 계정이 있든 없든 여기서 막지 않고,
   * 가입 가능 여부는 제출 응답으로 판정한다.
   */
  const handleEmailVerified = (
    data: PostSnsLoginResponse,
    verifiedEmail: string,
  ) => {
    // 서버가 바로 로그인시킨 경우다. GuestOnly 가 홈으로 보낸다.
    if (data.token && data.refreshToken) {
      clearSnsSignupContext();
      login({ accessToken: data.token, refreshToken: data.refreshToken });
      return;
    }

    setIsEmailVerified(true);

    if (!data.signupToken) return;

    const next: SnsSignupContext = {
      provider: context.provider,
      signupToken: data.signupToken,
      email: data.email ?? verifiedEmail,
    };
    // 새로고침으로 인증을 되돌리지 않도록 즉시 저장한다.
    saveSnsSignupContext(next);
    setContext(next);
  };

  const isSubmitDisabled =
    !(isReady || isEmailVerified) ||
    !isValid ||
    nicknameStatus !== "available" ||
    signupMutation.isPending;

  return (
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
        onChange={(key, next) => setValue(key, next, { shouldValidate: true })}
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
  );
}
