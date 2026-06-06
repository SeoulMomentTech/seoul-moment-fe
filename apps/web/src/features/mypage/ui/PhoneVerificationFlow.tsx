"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useQueryClient } from "@tanstack/react-query";
import {
  PhoneVerificationModal,
  PhoneVerificationResultModal,
} from "@widgets/phone-verification-modal";

import { usePostInfoPhoneCodeMutation } from "../api/usePostInfoPhoneCodeMutation";
import { usePostInfoPhoneVerifyMutation } from "../api/usePostInfoPhoneVerifyMutation";

interface PhoneVerificationFlowProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

type ResultState = null | "success" | "error";

export function PhoneVerificationFlow({
  open,
  onOpenChange,
}: PhoneVerificationFlowProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resultState, setResultState] = useState<ResultState>(null);

  const resetFlow = () => {
    setIsCodeSent(false);
    setIsVerified(false);
    setResultState(null);
  };

  useEffect(() => {
    if (open) resetFlow();
  }, [open]);

  const sendCodeMutation = usePostInfoPhoneCodeMutation({
    onSuccess: () => setIsCodeSent(true),
  });

  const verifyCodeMutation = usePostInfoPhoneVerifyMutation({
    onSuccess: () => {
      setIsVerified(true);
      onOpenChange(false);
      setResultState("success");
    },
    onError: () => {
      onOpenChange(false);
      setResultState("error");
    },
  });

  const handleSendCode = (phone: string) => {
    if (sendCodeMutation.isPending) return;
    setIsCodeSent(false);
    sendCodeMutation.mutate(phone);
  };

  const handleVerifyCode = (phone: string, code: string) => {
    if (verifyCodeMutation.isPending) return;
    verifyCodeMutation.mutate({ phone, code });
  };

  const handleSuccessContinue = () => {
    queryClient.invalidateQueries({ queryKey: ["user", "info"] });
    toast.success(t("phone_verified"));
    setResultState(null);
    resetFlow();
  };

  const handleErrorRetry = () => {
    setResultState(null);
    setIsVerified(false);
    onOpenChange(true);
  };

  const handleErrorCancel = () => {
    setResultState(null);
    resetFlow();
  };

  return (
    <>
      <PhoneVerificationModal
        isCodeSent={isCodeSent}
        isSendingCode={sendCodeMutation.isPending}
        isVerified={isVerified}
        isVerifying={verifyCodeMutation.isPending}
        onOpenChange={onOpenChange}
        onSendCode={handleSendCode}
        onVerifyCode={handleVerifyCode}
        open={open}
      />

      {resultState === "success" && (
        <PhoneVerificationResultModal
          onContinue={handleSuccessContinue}
          onOpenChange={(next) => {
            if (!next) handleSuccessContinue();
          }}
          open
          status="success"
        />
      )}

      {resultState === "error" && (
        <PhoneVerificationResultModal
          onCancel={handleErrorCancel}
          onOpenChange={(next) => {
            if (!next) handleErrorCancel();
          }}
          onRetry={handleErrorRetry}
          open
          status="error"
        />
      )}
    </>
  );
}
