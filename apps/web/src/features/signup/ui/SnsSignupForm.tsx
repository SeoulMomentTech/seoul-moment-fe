"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  const router = useRouter();
  const [context, setContext] = useState<SnsSignupContext | null>(null);

  useEffect(() => {
    const stored = readSnsSignupContext();
    if (!stored) {
      toast.error(t("session_has_expired"));
      router.replace("/login");
      return;
    }
    setContext(stored);
  }, [router, t]);

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
      toast.success(t("registration_completed"), { position: "top-center" });
      router.replace("/login");
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
          {t("signup_complete")}
        </button>
      </div>
    </form>
  );
}
