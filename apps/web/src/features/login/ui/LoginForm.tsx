"use client";

import { useTranslations } from "next-intl";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";

import { cn, HStack, Input, VStack } from "@seoul-moment/ui";

import { useUserLoginMutation } from "../api/useUserLoginMutation";
import { loginFormResolver, type LoginFormValues } from "../model/schema";

export function LoginForm() {
  const t = useTranslations();
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
    onError: () => {
      toast.error(t("login_failed"));
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = ({ account, password }) =>
    loginMutation.mutate({ email: account, password });

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[34px]" gap={14}>
        <Input
          className="max-sm:h-12"
          placeholder={t("enter_email")}
          type="text"
          {...register("account")}
        />
        <Input
          className="max-sm:h-12"
          placeholder={t("enter_password")}
          type="password"
          {...register("password")}
        />
        <HStack align="end" className="w-full">
          <Link
            className="text-body-3 cursor-pointer leading-none text-black/60 underline"
            href="/find-password"
          >
            {t("forgot_password_1")}
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
          {t("login")}
        </button>
      </div>
    </form>
  );
}
