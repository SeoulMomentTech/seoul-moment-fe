"use client";

import { useEffect, useState } from "react";

import { format } from "date-fns";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

import { useRouter } from "@/i18n/navigation";

import { Button, cn, Flex, HStack, Input, VStack } from "@seoul-moment/ui";

import PasswordField from "./PasswordField";
import usePostEmailCodeMutation from "../api/usePostEmailCodeMutation";
import useUserSignUpMutation from "../api/useUserSignUpMutation";
import useVerifyEmailCodeMutation from "../api/useVerifyEmailCodeMutation";
import {
  RESEND_INITIAL_SECONDS,
  signupFormResolver,
  type SignupFormValues,
} from "../model/schema";

const AGREE_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

export default function SignupForm() {
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
      password: "",
      passwordConfirm: "",
    },
  });

  const email = watch("email");
  const verificationCode = watch("verificationCode");
  const isVerified = watch("isVerified");
  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");

  const postEmailCodeMutation = usePostEmailCodeMutation({
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
      setVerifyError("驗證碼錯誤,請重新確認。");
    },
  });

  const signUpMutation = useUserSignUpMutation({
    onSuccess: () => {
      router.replace("/login");
    },
  });

  const handleSendCode = async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) return;

    setVerifyError(null);
    setValue("verificationCode", "", { shouldValidate: true });
    setValue("isVerified", false, { shouldValidate: true });
    postEmailCodeMutation.mutate(email);
  };

  const handleVerifyCode = () => {
    if (!email || !verificationCode) return;
    verifyEmailCodeMutation.mutate({ email, code: verificationCode });
  };

  const onSubmit: SubmitHandler<SignupFormValues> = (values) => {
    signUpMutation.mutate({
      email: values.email,
      password: values.password,
      personalInfoAgreeDate: format(new Date(), AGREE_DATE_FORMAT),
    });
  };

  const isSubmitDisabled = !isValid || signUpMutation.isPending;
  const isResendDisabled =
    !email || postEmailCodeMutation.isPending || resendSeconds > 0;
  const sendButtonLabel = isCodeSent
    ? resendSeconds > 0
      ? `重新發送 (${resendSeconds}s)`
      : "重新發送"
    : "發送驗證碼";

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[64px]" gap={16}>
        <Input
          className="max-sm:h-12"
          placeholder="請輸入電子信箱"
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
              placeholder="請輸入驗證碼"
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
                {isVerified ? "已驗證" : "確認"}
              </Button>
            )}
          </HStack>
          {isCodeSent && !isVerified && !verifyError && (
            <span className="text-body-4 text-black/60">
              驗證碼已發送至您的電子信箱。
            </span>
          )}
          {verifyError && (
            <span className="text-body-4 text-error">{verifyError}</span>
          )}
          {isVerified && (
            <span className="text-body-4 text-sent">電子信箱驗證成功。</span>
          )}
        </Flex>
        <PasswordField
          placeholder="請輸入密碼"
          showChecklist={password.length > 0}
          value={password}
          {...register("password")}
        />
        <PasswordField
          placeholder="確認密碼"
          value={passwordConfirm}
          {...register("passwordConfirm")}
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
          disabled={isSubmitDisabled}
          type="submit"
        >
          立即註冊
        </button>
      </div>
    </form>
  );
}
