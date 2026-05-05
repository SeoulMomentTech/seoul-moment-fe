"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";

import { cn, HStack, Input, VStack } from "@seoul-moment/ui";

import { useUserLoginMutation } from "../api/useUserLoginMutation";
import { loginFormResolver, type LoginFormValues } from "../model/schema";

const ERROR_MESSAGE = "Please check your email or password";

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginFormValues>({
    resolver: loginFormResolver,
    mode: "onChange",
    defaultValues: { account: "", password: "" },
  });

  const loginMutation = useUserLoginMutation({
    onSuccess: () => {
      // 이전 페이지로 복귀. 직접 /login 으로 진입해 history 가 비어 있으면 홈으로.
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.replace("/");
      }
    },
    onError: () => {
      toast.error(ERROR_MESSAGE);
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = ({ account, password }) =>
    loginMutation.mutate({ email: account, password });

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[34px]" gap={14}>
        <Input
          className="max-sm:h-12"
          placeholder="請輸入電子信箱"
          type="text"
          {...register("account")}
        />
        <Input
          className="max-sm:h-12"
          placeholder="請輸入密碼"
          type="password"
          {...register("password")}
        />
        <HStack align="end" className="w-full">
          <Link
            className="text-body-3 cursor-pointer leading-none text-black/60 underline"
            href="/find-password"
          >
            忘記密碼
          </Link>
        </HStack>
      </VStack>

      <div className="w-full pt-[30px]">
        <button
          className={cn(
            "flex w-full cursor-pointer items-center justify-center rounded-[4px]",
            "bg-black px-[20px] py-[16px] font-semibold text-white",
            "disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-black/40",
            "max-md:h-12",
          )}
          disabled={!isValid || loginMutation.isPending}
          type="submit"
        >
          로그인
        </button>
      </div>
    </form>
  );
}
