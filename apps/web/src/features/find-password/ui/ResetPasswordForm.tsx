"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";

import { PasswordChecklist } from "@shared/ui/password-checklist";
import { PasswordField } from "@shared/ui/password-field";

import { Button, VStack } from "@seoul-moment/ui";

import { usePatchPasswordMutation } from "../api/usePatchPasswordMutation";
import {
  type ResetPasswordFormValues,
  resetPasswordFormResolver,
} from "../model/schema";

interface ResetPasswordFormProps {
  token: string;
  onSuccess(): void;
}

export function ResetPasswordForm({
  token,
  onSuccess,
}: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<ResetPasswordFormValues>({
    resolver: resetPasswordFormResolver,
    mode: "onChange",
    defaultValues: { password: "", passwordConfirm: "" },
  });

  const password = watch("password");
  const passwordConfirm = watch("passwordConfirm");

  const patchPasswordMutation = usePatchPasswordMutation({
    onSuccess,
  });

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = ({
    password: newPassword,
  }) => {
    patchPasswordMutation.mutate({ password: newPassword, token });
  };

  const isSubmitDisabled = !isValid || patchPasswordMutation.isPending;

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full" gap={40}>
        <VStack className="w-full" gap={16}>
          <PasswordField
            placeholder="비밀번호 입력"
            value={password}
            {...register("password")}
          />
          <PasswordField
            placeholder="비밀번호 재입력"
            value={passwordConfirm}
            {...register("passwordConfirm")}
          />
          <PasswordChecklist value={password} />
        </VStack>
        <Button
          className="text-body-2 h-auto w-full rounded-[4px] px-[20px] py-[16px] font-semibold text-white"
          disabled={isSubmitDisabled}
          type="submit"
        >
          변경하기
        </Button>
      </VStack>
    </form>
  );
}
