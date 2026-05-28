"use client";

import { useEffect, useState } from "react";

import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useGoogleSignupMutation } from "@features/login/api/useGoogleSignupMutation";
import {
  clearSnsSignupContext,
  readSnsSignupContext,
  type SnsSignupContext,
} from "@features/login/lib/snsAuthStorage";
import { useNicknameValidate } from "@shared/lib/hooks";
import { NICKNAME_MAX_LENGTH, sanitizeNickname } from "@shared/lib/nickname";

import { useRouter } from "@/i18n/navigation";

import { cn, Flex, Input, VStack } from "@seoul-moment/ui";

import { MarketingConsent } from "./MarketingConsent";
import {
  snsSignupFormResolver,
  type SnsSignupFormValues,
} from "../model/snsSchema";

export function SnsSignupForm() {
  const router = useRouter();
  const [context, setContext] = useState<SnsSignupContext | null>(null);

  useEffect(() => {
    const stored = readSnsSignupContext();
    if (!stored) {
      toast.error("SNS 가입 세션이 만료되었습니다. 다시 시도해주세요.");
      router.replace("/login");
      return;
    }
    setContext(stored);
  }, [router]);

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

  const signupMutation = useGoogleSignupMutation({
    onSuccess: () => {
      clearSnsSignupContext();
      toast.success("가입이 완료되었습니다.", { position: "top-center" });
    },
  });

  const onSubmit: SubmitHandler<SnsSignupFormValues> = (values) => {
    if (!context) return;
    signupMutation.mutate({
      signupToken: context.signupToken,
      nickname: values.nickname,
      newProductAgreed: values.newProductAgreed,
      adAgreed: values.adAgreed,
      recommendAgreed: values.recommendAgreed,
    });
  };

  if (!context) return null;

  const isSubmitDisabled =
    !isValid || nicknameStatus !== "available" || signupMutation.isPending;

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <VStack className="w-full pt-[64px]" gap={16}>
        <Flex className="w-full" direction="column" gap={6}>
          <p className="text-body-3 leading-none text-black/60">계정</p>
          <Input
            className="bg-black/5 max-sm:h-12"
            disabled
            readOnly
            value={context.email}
          />
        </Flex>

        <Flex className="w-full" direction="column" gap={6}>
          <Input
            className="max-sm:h-12"
            maxLength={NICKNAME_MAX_LENGTH}
            placeholder="영문, 숫자만 입력 가능 (2~20자)"
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
          가입 완료
        </button>
      </div>
    </form>
  );
}
