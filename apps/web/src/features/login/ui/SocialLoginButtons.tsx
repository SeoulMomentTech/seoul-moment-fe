"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import type { PostSnsLoginResponse } from "@shared/services/auth";

import { useRouter } from "@/i18n/navigation";

import { Button, cn, VStack } from "@seoul-moment/ui";

import { SnsLinkConfirmDialog } from "./SnsLinkConfirmDialog";
import { useGoogleLoginMutation } from "../api/useGoogleLoginMutation";
import { useLineLoginMutation } from "../api/useLineLoginMutation";
import {
  GoogleSignInCancelledError,
  requestGoogleIdToken,
} from "../lib/googleIdentity";
import {
  clearLineSession,
  getValidLineIdToken,
  isLineLoginConfigured,
  startLineLogin,
} from "../lib/lineIdentity";
import {
  consumeLineLoginPending,
  markLineLoginPending,
  saveSnsSignupContext,
  type SnsProvider,
} from "../lib/snsAuthStorage";

interface LinkPromptState {
  provider: SnsProvider;
  email: string;
  linkToken: string;
}

const SOCIAL_BUTTON_CLASS = cn(
  "flex h-12 w-full cursor-pointer items-center gap-[4px] rounded-[4px] border border-black/20 bg-white px-[20px] py-[12px]",
  "relative",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

const isLineEnabled = isLineLoginConfigured();

export function SocialLoginButtons() {
  const t = useTranslations();
  const router = useRouter();
  const login = useUserAuthStore((s) => s.login);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);
  const [isStartingLine, setIsStartingLine] = useState(false);
  const [linkPrompt, setLinkPrompt] = useState<LinkPromptState | null>(null);

  /**
   * login 응답의 3분기는 provider 와 무관하게 동일하다.
   * 토큰이 있으면 즉시 로그인, 없으면 needsLinkConfirm / needsSignup 으로 갈린다.
   */
  const handleSnsLoginSuccess = (
    provider: SnsProvider,
    data: PostSnsLoginResponse,
  ) => {
    if (data.token && data.refreshToken) {
      login({ accessToken: data.token, refreshToken: data.refreshToken });
      return;
    }
    if (data.needsLinkConfirm && data.linkToken && data.email) {
      setLinkPrompt({
        provider,
        email: data.email,
        linkToken: data.linkToken,
      });
      return;
    }
    // LINE 은 이메일을 주지 않을 수 있으므로 email 없이도 가입으로 넘어간다.
    if (data.needsSignup && data.signupToken) {
      saveSnsSignupContext({
        provider,
        signupToken: data.signupToken,
        email: data.email,
      });
      router.push("/signup/sns");
      return;
    }
    toast.error(
      t(
        provider === "line"
          ? "line_login_response_error"
          : "google_login_response_error",
      ),
    );
  };

  const googleLoginMutation = useGoogleLoginMutation({
    onSuccess: (data) => handleSnsLoginSuccess("google", data),
    onError: () => {
      toast.error(t("google_login_failed"));
    },
  });

  const lineLoginMutation = useLineLoginMutation({
    onSuccess: (data) => handleSnsLoginSuccess("line", data),
    onError: (error) => {
      // 서버가 id_token 을 거절했다면 그 토큰으로는 다시 시도해도 같은 결과다.
      // 세션을 버려 다음 클릭이 새 토큰을 받도록 한다.
      if (error.response.status === 401) void clearLineSession();
      toast.error(t("line_login_failed"));
    },
  });
  // 복귀 effect 가 안정적인 식별자에만 의존하도록 mutate 를 분리한다.
  const { mutate: mutateLineLogin } = lineLoginMutation;

  /**
   * LIFF 로그인은 리다이렉트라서 인증을 마치면 이 페이지로 되돌아온다.
   * 우리가 시작한 로그인일 때만(pending 플래그) 이어받는다.
   * 플래그는 읽는 즉시 소비되므로 effect 가 다시 돌아도 중복 실행되지 않는다.
   */
  useEffect(() => {
    if (!consumeLineLoginPending()) return;

    let cancelled = false;

    void (async () => {
      try {
        const idToken = await getValidLineIdToken();
        if (cancelled) return;
        // 동의 화면에서 취소했거나 세션이 만료된 경우다. 사용자가 의도한
        // 중단일 수 있으므로 오류를 띄우지 않는다.
        if (!idToken) return;
        mutateLineLogin({ idToken });
      } catch {
        if (!cancelled) toast.error(t("line_login_failed"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mutateLineLogin, t]);

  const handleGoogleClick = async () => {
    if (isStartingGoogle || googleLoginMutation.isPending) return;
    setIsStartingGoogle(true);
    try {
      const idToken = await requestGoogleIdToken();
      googleLoginMutation.mutate({ idToken });
    } catch (error) {
      if (!(error instanceof GoogleSignInCancelledError)) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("google_login_start_error"),
        );
      }
    } finally {
      setIsStartingGoogle(false);
    }
  };

  const handleLineClick = async () => {
    if (isStartingLine || lineLoginMutation.isPending) return;
    setIsStartingLine(true);
    try {
      const idToken = await getValidLineIdToken();
      if (idToken) {
        mutateLineLogin({ idToken });
        return;
      }
      // 쓸 수 있는 id_token 이 없으면 LINE 인증 화면으로 나간다.
      // 복귀 처리는 위 effect 가 받는다.
      markLineLoginPending();
      await startLineLogin();
    } catch (error) {
      // 리다이렉트에 실패했으므로 복귀 대기 상태를 남기지 않는다.
      consumeLineLoginPending();
      toast.error(
        error instanceof Error ? error.message : t("line_login_start_error"),
      );
    } finally {
      setIsStartingLine(false);
    }
  };

  const isGoogleBusy = isStartingGoogle || googleLoginMutation.isPending;
  const isLineBusy = isStartingLine || lineLoginMutation.isPending;

  return (
    <>
      <VStack className="w-full pt-[38px] max-md:pt-[120px]" gap={8}>
        <Button
          className={SOCIAL_BUTTON_CLASS}
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
            {isGoogleBusy ? `${t("logging_in")}...` : t("login_in_with_google")}
          </span>
        </Button>

        {isLineEnabled && (
          <Button
            className={SOCIAL_BUTTON_CLASS}
            disabled={isLineBusy}
            onClick={handleLineClick}
            type="button"
            variant="outline"
          >
            <Image
              alt=""
              className="absolute left-[20px]"
              height={24}
              src="/login/line.png"
              width={24}
            />
            <span className="flex-1 text-center font-semibold text-black">
              {isLineBusy ? `${t("logging_in")}...` : t("login_in_with_line")}
            </span>
          </Button>
        )}
      </VStack>

      {linkPrompt && (
        <SnsLinkConfirmDialog
          email={linkPrompt.email}
          linkToken={linkPrompt.linkToken}
          onOpenChange={(open) => {
            if (!open) setLinkPrompt(null);
          }}
          open
          provider={linkPrompt.provider}
        />
      )}
    </>
  );
}
