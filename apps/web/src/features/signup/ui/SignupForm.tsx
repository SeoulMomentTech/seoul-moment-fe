"use client";

import { useEffect, useState } from "react";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useNicknameValidate } from "@shared/lib/hooks";
import { PasswordField } from "@shared/ui/password-field";
import { TermsConsent } from "@shared/ui/terms-consent";

import { useRouter } from "@/i18n/navigation";

import { Button, cn, Flex, HStack, Input, VStack } from "@seoul-moment/ui";

import { usePostUserEmailCodeMutation } from "../api/usePostUserEmailCodeMutation";
import { useUserSignUpMutation } from "../api/useUserSignUpMutation";
import { useVerifyEmailCodeMutation } from "../api/useVerifyEmailCodeMutation";
import {
  RESEND_INITIAL_SECONDS,
  signupFormResolver,
  type SignupFormValues,
} from "../model/schema";

export function SignupForm() {
  const router = useRouter();
  const [isCodeSent, setIsCodeSent] = useState(false);
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

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { isValid },
  } = useForm<SignupFormValues>({
    resolver: signupFormResolver,
    mode: "onChange",
    defaultValues: {
      email: "",
      verificationCode: "",
      isVerified: false,
      nickname: "",
      password: "",
      passwordConfirm: "",
      termsOfService: false,
      privacyPolicy: false,
    },
  });

  const email = watch("email");
  const verificationCode = watch("verificationCode");
  const isVerified = watch("isVerified");
  const nickname = watch("nickname");
  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");
  const termsOfService = watch("termsOfService");
  const privacyPolicy = watch("privacyPolicy");

  const { status: nicknameStatus, message: nicknameMessage } =
    useNicknameValidate({ nickname });

  const postUserEmailCodeMutation = usePostUserEmailCodeMutation({
    onSuccess: () => {
      setIsCodeSent(true);
      setResendSeconds(RESEND_INITIAL_SECONDS);
    },
  });

  const verifyEmailCodeMutation = useVerifyEmailCodeMutation({
    onSuccess: () => {
      setVerifyError(null);
      setValue("isVerified", true, { shouldValidate: true });
    },
    onError: () => {
      setValue("isVerified", false, { shouldValidate: true });
      setVerifyError("인증코드가 일치하지 않습니다. 다시 확인해주세요.");
    },
  });

  const signUpMutation = useUserSignUpMutation({
    onSuccess: () => {
      toast.success("가입이 완료되었습니다. 로그인해주세요.", {
        position: "top-center",
      });
      router.replace("/login");
    },
  });

  const handleSendCode = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    setVerifyError(null);
    setValue("verificationCode", "", { shouldValidate: true });
    setValue("isVerified", false, { shouldValidate: true });
    postUserEmailCodeMutation.mutate(email);
  };

  const handleVerifyCode = () => {
    if (!email || !verificationCode) return;
    verifyEmailCodeMutation.mutate({ email, code: verificationCode });
  };

  const onSubmit: SubmitHandler<SignupFormValues> = (values) => {
    signUpMutation.mutate({
      email: values.email,
      password: values.password,
      nickname: values.nickname,
    });
  };

  const isSubmitDisabled =
    !isValid || nicknameStatus !== "available" || signUpMutation.isPending;
  const isResendDisabled =
    !email || postUserEmailCodeMutation.isPending || resendSeconds > 0;
  const sendButtonLabel = isCodeSent
    ? resendSeconds > 0
      ? `재발송 (${resendSeconds}s)`
      : "재발송"
    : "인증코드 발송";

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[64px]" gap={16}>
        <Input
          className="max-sm:h-12"
          placeholder="이메일을 입력해주세요"
          type="email"
          {...register("email", {
            onChange: () => {
              if (isCodeSent) setIsCodeSent(false);
              if (isVerified)
                setValue("isVerified", false, { shouldValidate: true });
              if (verifyError) setVerifyError(null);
            },
          })}
        />
        <Flex className="w-full" direction="column" gap={6}>
          <HStack className="w-full" gap={8}>
            <Input
              className="flex-1 max-sm:h-12"
              inputMode="numeric"
              placeholder="인증코드를 입력해주세요"
              type="text"
              {...register("verificationCode", {
                onChange: () => {
                  if (isVerified)
                    setValue("isVerified", false, { shouldValidate: true });
                  if (verifyError) setVerifyError(null);
                },
              })}
              disabled={isVerified}
            />
            <Button
              className={cn(
                "text-body-3 h-[58.5px] shrink-0 rounded-[4px] py-[16px] font-semibold text-white",
                "max-sm:h-12 max-sm:py-0",
              )}
              disabled={isResendDisabled}
              onClick={handleSendCode}
              type="button"
            >
              {sendButtonLabel}
            </Button>
            {isCodeSent && (
              <Button
                className={cn(
                  "text-body-3 h-[58.5px] shrink-0 rounded-[4px] py-[16px] font-semibold text-white",
                  "max-sm:h-12 max-sm:py-0",
                )}
                disabled={
                  !verificationCode ||
                  isVerified ||
                  verifyEmailCodeMutation.isPending
                }
                onClick={handleVerifyCode}
                type="button"
              >
                {isVerified ? "인증 완료" : "확인"}
              </Button>
            )}
          </HStack>
          {isCodeSent && !isVerified && !verifyError && (
            <span className="text-body-4 text-black/60">
              인증코드가 이메일로 발송되었습니다.
            </span>
          )}
          {verifyError && (
            <span className="text-body-4 text-error">{verifyError}</span>
          )}
          {isVerified && (
            <span className="text-body-4 text-sent">
              이메일 인증이 완료되었습니다.
            </span>
          )}
        </Flex>
        <Flex className="w-full" direction="column" gap={6}>
          <Input
            className="max-sm:h-12"
            maxLength={20}
            placeholder="닉네임을 입력해주세요 (2~20자)"
            type="text"
            {...register("nickname")}
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
        <PasswordField
          placeholder="비밀번호를 입력해주세요"
          showChecklist={password.length > 0}
          value={password}
          {...register("password")}
        />
        <PasswordField
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          {...register("passwordConfirm")}
        />
      </VStack>

      <TermsConsent
        onChange={(key, next) => setValue(key, next, { shouldValidate: true })}
        privacyPolicy={privacyPolicy}
        termsOfService={termsOfService}
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
          회원가입
        </button>
      </div>
    </form>
  );
}
