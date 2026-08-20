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

interface LinkPromptState {
  email: string;
  linkToken: string;
}

export function SnsSignupForm() {
  const t = useTranslations();
  const router = useRouter();
  const login = useUserAuthStore((s) => s.login);
  const [context, setContext] = useState<SnsSignupContext | null>(null);
  const [linkPrompt, setLinkPrompt] = useState<LinkPromptState | null>(null);
  // 이메일 인증 블록을 초기 상태로 되돌릴 때 올린다.
  const [verificationKey, setVerificationKey] = useState(0);

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
   * 이메일 인증 응답은 login 과 같은 shape 이다. 인증한 이메일로 이미 가입된
   * 계정이 있으면 연결(2-A), 없으면 가입(2-B) 으로 갈린다.
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
    if (data.needsLinkConfirm && data.linkToken) {
      setLinkPrompt({
        email: data.email ?? verifiedEmail,
        linkToken: data.linkToken,
      });
      return;
    }
    if (data.needsSignup && data.signupToken) {
      const next: SnsSignupContext = {
        provider: context.provider,
        signupToken: data.signupToken,
        email: data.email ?? verifiedEmail,
      };
      // 새로고침으로 인증을 되돌리지 않도록 즉시 저장한다.
      saveSnsSignupContext(next);
      setContext(next);
      return;
    }
    toast.error(t("line_login_response_error"));
  };

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
              key={verificationKey}
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
          onCancel={() => {
            // 연결을 거부하면 그 이메일로는 가입할 수 없다. 다른 이메일로
            // 다시 인증할 수 있도록 입력 상태를 비운다.
            toast.error(t("account_exists"));
            setVerificationKey((key) => key + 1);
          }}
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
