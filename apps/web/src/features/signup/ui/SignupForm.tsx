"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useNicknameValidate } from "@shared/lib/hooks";
import { NICKNAME_MAX_LENGTH, sanitizeNickname } from "@shared/lib/nickname";
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
  const t = useTranslations();
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
      setVerifyError(t("code_not_match"));
    },
  });

  const signUpMutation = useUserSignUpMutation({
    onSuccess: () => {
      toast.success(t("registration_complete"), {
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
      ? `${t("resend")} (${resendSeconds}s)`
      : t("resend")
    : t("send_verification_code");

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[64px]" gap={16}>
        <Input
          className="max-sm:h-12"
          placeholder={t("enter_email")}
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
              placeholder={t("enter_code")}
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
        <Flex className="w-full" direction="column" gap={6}>
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
        <PasswordField
          placeholder={t("enter_password")}
          showChecklist={password.length > 0}
          value={password}
          {...register("password")}
        />
        <PasswordField
          placeholder={t("confirm_password")}
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
          {t("sign_up")}
        </button>
      </div>
    </form>
  );
}
