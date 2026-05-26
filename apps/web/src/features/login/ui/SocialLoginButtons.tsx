"use client";

import { useState } from "react";

import Image from "next/image";
import { toast } from "sonner";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { useRouter } from "@/i18n/navigation";

import { Button, cn, VStack } from "@seoul-moment/ui";

import { GoogleLinkConfirmDialog } from "./GoogleLinkConfirmDialog";
import { useGoogleLoginMutation } from "../api/useGoogleLoginMutation";
import {
  GoogleSignInCancelledError,
  requestGoogleIdToken,
} from "../lib/googleIdentity";
import { saveSnsSignupContext } from "../lib/snsAuthStorage";

interface LinkPromptState {
  email: string;
  linkToken: string;
}

export function SocialLoginButtons() {
  const router = useRouter();
  const login = useUserAuthStore((s) => s.login);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [linkPrompt, setLinkPrompt] = useState<LinkPromptState | null>(null);

  const googleLoginMutation = useGoogleLoginMutation({
    onSuccess: (data) => {
      if (data.token && data.refreshToken) {
        login({ accessToken: data.token, refreshToken: data.refreshToken });
        return;
      }
      if (data.needsLinkConfirm && data.linkToken && data.email) {
        setLinkPrompt({ email: data.email, linkToken: data.linkToken });
        return;
      }
      if (data.needsSignup && data.signupToken && data.email) {
        saveSnsSignupContext({
          signupToken: data.signupToken,
          email: data.email,
        });
        router.push("/signup/sns");
        return;
      }
      toast.error("Google 로그인 응답을 처리할 수 없습니다.");
    },
    onError: () => {
      toast.error("Google 로그인에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleGoogleClick = async () => {
    if (isStartingGoogle || googleLoginMutation.isPending) return;
    setIsStartingGoogle(true);
    try {
      const idToken = await requestGoogleIdToken();

      console.log(idToken);

      googleLoginMutation.mutate({ idToken });
    } catch (error) {
      if (!(error instanceof GoogleSignInCancelledError)) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Google 로그인을 시작할 수 없습니다.",
        );
      }
    } finally {
      setIsStartingGoogle(false);
    }
  };

  const isGoogleBusy = isStartingGoogle || googleLoginMutation.isPending;

  return (
    <>
      <VStack className="w-full pt-[38px] max-md:pt-[120px]" gap={8}>
        <Button
          className={cn(
            "flex h-12 w-full cursor-pointer items-center gap-[4px] rounded-[4px] border border-black/20 bg-white px-[20px] py-[12px]",
            "relative",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
          disabled={isGoogleBusy}
          onClick={handleGoogleClick}
          type="button"
          variant="outline"
        >
          <Image
            alt=""
            className="absolute left-[20px]"
            height={24}
            src="/login/google.svg"
            width={24}
          />
          <span className="flex-1 text-center font-semibold text-black">
            {isGoogleBusy ? "로그인 중..." : "구글로 로그인"}
          </span>
        </Button>
      </VStack>

      {linkPrompt && (
        <GoogleLinkConfirmDialog
          email={linkPrompt.email}
          linkToken={linkPrompt.linkToken}
          onOpenChange={(open) => {
            if (!open) setLinkPrompt(null);
          }}
          open
        />
      )}
    </>
  );
}
