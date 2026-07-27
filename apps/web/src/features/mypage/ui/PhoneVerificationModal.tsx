"use client";

import { useEffect, useState } from "react";

import { ChevronLeftIcon, XIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { TAIWAN_DIAL_CODE } from "@shared/lib/utils";

import {
  Button,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  HStack,
  VStack,
} from "@seoul-moment/ui";

const DEFAULT_CODE_TIMEOUT_SECONDS = 180;

interface PhoneVerificationModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  onSendCode(phone: string): void;
  onVerifyCode(phone: string, code: string): void;
  isCodeSent?: boolean;
  isVerified?: boolean;
  isSendingCode?: boolean;
  isVerifying?: boolean;
  errorMessage?: string | null;
  codeTimeoutSeconds?: number;
}

const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function PhoneVerificationModal({
  open,
  onOpenChange,
  onSendCode,
  onVerifyCode,
  isCodeSent = false,
  isVerified = false,
  isSendingCode = false,
  isVerifying = false,
  errorMessage,
  codeTimeoutSeconds = DEFAULT_CODE_TIMEOUT_SECONDS,
}: PhoneVerificationModalProps) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const t = useTranslations();

  useEffect(() => {
    if (!open) {
      setPhone("");
      setCode("");
      setSecondsLeft(0);
    }
  }, [open]);

  useEffect(() => {
    if (!isCodeSent) return;
    setSecondsLeft(codeTimeoutSeconds);
  }, [isCodeSent, codeTimeoutSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(
      () => setSecondsLeft((prev) => Math.max(prev - 1, 0)),
      1000,
    );
    return () => clearInterval(id);
  }, [secondsLeft]);

  const isPhoneEmpty = phone.trim().length === 0;
  const isCodeEmpty = code.trim().length === 0;
  const isSendDisabled = isPhoneEmpty || isSendingCode || isVerified;
  const isVerifyDisabled =
    isCodeEmpty || !isCodeSent || isVerifying || isVerified || secondsLeft <= 0;
  const showSentMessage = isCodeSent && !isVerified;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          "gap-0 border-0 bg-white p-0 shadow-[0px_2px_10px_rgba(0,0,0,0.04)]",
          "sm:w-[444px] sm:max-w-[444px] sm:rounded-[8px]",
          "max-sm:left-0 max-sm:top-0 max-sm:h-screen max-sm:w-screen",
          "max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0",
          "max-sm:rounded-none",
          "max-sm:data-[state=open]:slide-in-from-bottom",
          "max-sm:data-[state=open]:[--tw-enter-scale:1]",
          "max-sm:data-[state=open]:[--tw-enter-opacity:1]",
          "max-sm:data-[state=closed]:slide-out-to-bottom",
          "max-sm:data-[state=closed]:[--tw-exit-scale:1]",
          "max-sm:data-[state=closed]:[--tw-exit-opacity:1]",
        )}
        showCloseButton={false}
      >
        <div className="flex h-full w-full flex-col">
          <header
            className={cn(
              "relative w-full",
              "sm:pr-[24px] sm:pt-[24px]",
              "max-sm:h-14 max-sm:border-b max-sm:border-black/10 max-sm:px-[20px]",
            )}
          >
            <DialogClose
              aria-label={t("back")}
              className={cn(
                "absolute left-[20px] top-1/2 -translate-y-1/2 cursor-pointer outline-none",
                "sm:hidden",
              )}
            >
              <ChevronLeftIcon size={24} />
            </DialogClose>

            <div className="flex h-full w-full items-center sm:hidden">
              <p className="text-body-2 text-foreground pl-[28px] font-semibold leading-none">
                {t("phone_verification")}
              </p>
            </div>

            <DialogClose
              aria-label={t("close")}
              className={cn(
                "ml-auto block cursor-pointer outline-none",
                "max-sm:hidden",
              )}
            >
              <XIcon size={24} />
            </DialogClose>
          </header>

          <div
            className={cn(
              "flex w-full flex-col",
              "sm:gap-[32px] sm:px-[24px] sm:pb-[40px] sm:pt-[8px]",
              "max-sm:flex-1 max-sm:gap-[32px] max-sm:px-[20px] max-sm:pb-[20px] max-sm:pt-[50px]",
            )}
          >
            <div className="flex w-full flex-col gap-[20px]">
              <DialogTitle
                className={cn(
                  "text-foreground w-full text-center font-semibold leading-none",
                  "sm:text-title-4",
                  "max-sm:sr-only",
                )}
              >
                {t("phone_verification")}
              </DialogTitle>

              <p className="text-body-3 w-full text-center leading-none text-black/40 max-sm:hidden">
                {t("verification_description_1")}
              </p>
              <p className="text-title-4 text-foreground hidden w-full whitespace-pre-line text-center font-semibold leading-normal max-sm:block">
                {t("verification_description_2")}
              </p>
            </div>

            <VStack align="top" className="w-full" gap={20}>
              <VStack align="top" className="w-full" gap={8}>
                <HStack align="center" className="w-full" gap={8}>
                  <HStack
                    align="center"
                    className={cn(
                      "h-[58.5px] flex-1 rounded-[4px] border border-black/20 bg-white",
                      "px-[12px] py-[16px]",
                      "focus-within:border-foreground",
                      isVerified && "bg-black/5",
                    )}
                    gap={8}
                  >
                    <span className="text-body-2 text-foreground shrink-0 leading-none">
                      {TAIWAN_DIAL_CODE}
                    </span>
                    <input
                      autoComplete="tel"
                      className={cn(
                        "text-body-2 text-foreground placeholder:text-black/40",
                        "min-w-0 flex-1 bg-transparent leading-none outline-none",
                        "disabled:cursor-not-allowed",
                      )}
                      disabled={isVerified}
                      inputMode="numeric"
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder={t("input_phone")}
                      type="tel"
                      value={phone}
                    />
                  </HStack>
                  <Button
                    className="h-[58.5px] shrink-0 rounded-[4px] py-[16px] font-semibold"
                    disabled={isSendDisabled}
                    onClick={() => onSendCode(phone)}
                    type="button"
                  >
                    {t("verification")}
                  </Button>
                </HStack>
                {showSentMessage && (
                  <p className="text-body-3 text-info w-full leading-none">
                    {t("code_sent_to_sms")}
                  </p>
                )}
              </VStack>

              <VStack align="top" className="w-full" gap={8}>
                <HStack align="center" className="w-full" gap={8}>
                  <HStack
                    align="center"
                    className={cn(
                      "h-[58.5px] flex-1 rounded-[4px] border border-black/20 bg-white",
                      "px-[12px] py-[16px]",
                      "focus-within:border-foreground",
                    )}
                    gap={8}
                  >
                    <input
                      className={cn(
                        "text-body-2 text-foreground placeholder:text-black/40",
                        "min-w-0 flex-1 bg-transparent leading-none outline-none",
                        "disabled:cursor-not-allowed",
                      )}
                      disabled={!isCodeSent || isVerified}
                      inputMode="numeric"
                      onChange={(event) => setCode(event.target.value)}
                      placeholder={t("enter_code")}
                      type="text"
                      value={code}
                    />
                    {isCodeSent && !isVerified && (
                      <span className="text-body-3 shrink-0 leading-none text-black/40">
                        {formatTimer(secondsLeft)}
                      </span>
                    )}
                  </HStack>
                  <Button
                    className="h-[58.5px] shrink-0 rounded-[4px] py-[16px] font-semibold"
                    disabled={isVerifyDisabled}
                    onClick={() => onVerifyCode(phone, code)}
                    type="button"
                  >
                    {isVerified ? t("verification_success_full") : t("confirm")}
                  </Button>
                </HStack>
                {errorMessage && (
                  <p className="text-body-3 text-danger w-full leading-none">
                    {errorMessage}
                  </p>
                )}
                {isVerified && (
                  <p className="text-body-3 text-info w-full leading-none">
                    {t("phone_verify_completed")}
                  </p>
                )}
              </VStack>
            </VStack>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
