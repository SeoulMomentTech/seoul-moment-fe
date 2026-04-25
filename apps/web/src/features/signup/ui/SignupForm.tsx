"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

import { cn, Input, VStack } from "@seoul-moment/ui";

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
    defaultValues: { account: "", password: "", passwordConfirm: "" },
  });

  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");

  const onSubmit: SubmitHandler<SignupFormValues> = () => {
    // TODO: API 연동
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[64px]" gap={16}>
        <Input
          className="max-sm:h-12"
          placeholder="請輸入手機號碼"
          type="text"
          {...register("account")}
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
