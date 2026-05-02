"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

import { Button, cn, HStack, Input, VStack } from "@seoul-moment/ui";

import PasswordField from "./PasswordField";
import { signupFormResolver, type SignupFormValues } from "../model/schema";

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<SignupFormValues>({
    resolver: signupFormResolver,
    mode: "onChange",
    defaultValues: {
      email: "",
      phone: "",
      verificationCode: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");
  const phone = watch("phone");

  const onSubmit: SubmitHandler<SignupFormValues> = () => {
    // TODO: API 연동
  };

  const handleSendCode = () => {
    // TODO: API 연동 — 휴대폰 인증번호 발송
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[64px]" gap={16}>
        <Input
          className="max-sm:h-12"
          placeholder="請輸入電子信箱"
          type="email"
          {...register("email")}
        />
        <HStack className="w-full" gap={8}>
          <Input
            className="flex-1 max-sm:h-12"
            placeholder="請輸入手機號碼"
            type="tel"
            {...register("phone")}
          />
          <Button
            className={cn(
              "text-body-3 h-[58.5px] shrink-0 rounded-[4px] py-[16px] font-semibold text-white",
              "max-sm:h-12 max-sm:py-0",
            )}
            disabled={!phone}
            onClick={handleSendCode}
            type="button"
          >
            發送驗證碼
          </Button>
        </HStack>
        <Input
          className="max-sm:h-12"
          inputMode="numeric"
          placeholder="請輸入驗證碼"
          type="text"
          {...register("verificationCode")}
        />
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
          disabled={!isValid}
          type="submit"
        >
          立即註冊
        </button>
      </div>
    </form>
  );
}
