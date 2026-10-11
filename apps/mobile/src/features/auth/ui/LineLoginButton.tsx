import { useState } from "react";

import { useRouter } from "expo-router";
import { Alert, View } from "react-native";

import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import { Button } from "@shared/ui/button";
import { FieldNote } from "@shared/ui/field-note";

import { Spacing } from "@/constants/theme";

import {
  isLineLoginConfigured,
  LineUnavailableError,
  requestLineIdToken,
} from "../lib/lineIdentity";
import { classifySnsAuthResponse } from "../lib/snsAuthOutcome";
import { useLineLink, useLineLogin } from "../model/useSnsAuth";
import { useSnsSignUpStore } from "../model/useSnsSignUpStore";

/**
 * LINE 으로 계속하기. 누르면 네 갈래 중 하나로 끝난다 —
 * 바로 로그인 / 기존 계정에 연결 / 가입 화면으로 / 이메일부터 받기.
 *
 * 갈래를 정하는 것은 서버이고(classifySnsAuthResponse) 여기서는 그 결과를 실행만 한다.
 * 채널 ID 가 없으면 버튼 자체를 그리지 않는다 — 웹도 LIFF ID 가 없으면 숨긴다.
 */
export function LineLoginButton() {
  const router = useRouter();
  const login = useUserAuthStore((s) => s.login);
  const setContext = useSnsSignUpStore((s) => s.set);
  const lineLogin = useLineLogin();
  const lineLink = useLineLink();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();

  if (!isLineLoginConfigured) return null;

  const fail = (message: string) => {
    setProblem(message);
    setBusy(false);
  };

  const confirmLink = (email: string, linkToken: string) =>
    Alert.alert(
      "Link your LINE account",
      `${email} already has an account. Link LINE to it and sign in?`,
      [
        { text: "Cancel", style: "cancel", onPress: () => setBusy(false) },
        {
          text: "Link",
          onPress: () =>
            lineLink.mutate(linkToken, {
              onSuccess: (res) => {
                login({
                  accessToken: res.data.token,
                  refreshToken: res.data.refreshToken,
                });
                setBusy(false);
                if (router.canGoBack()) router.back();
                else router.replace("/my");
              },
              onError: () =>
                fail("We couldn't link that account. Please try again."),
            }),
        },
      ],
    );

  const start = async () => {
    setProblem(undefined);
    setBusy(true);

    let idToken: string;
    try {
      idToken = await requestLineIdToken();
    } catch (error) {
      // 사용자가 동의 화면을 닫은 것도 여기로 온다. 그때는 아무 말도 하지 않는다.
      if (error instanceof LineUnavailableError) {
        fail("LINE sign-in isn't available in this build.");
      } else {
        setBusy(false);
      }
      return;
    }

    lineLogin.mutate(idToken, {
      onSuccess: (res) => {
        const outcome = classifySnsAuthResponse(res.data);

        switch (outcome.kind) {
          case "loggedIn":
            login({
              accessToken: outcome.accessToken,
              refreshToken: outcome.refreshToken,
            });
            setBusy(false);
            if (router.canGoBack()) router.back();
            else router.replace("/my");
            return;
          case "needsLink":
            confirmLink(outcome.email, outcome.linkToken);
            return;
          case "readyToSignup":
            setContext({
              kind: "ready",
              signupToken: outcome.signupToken,
              email: outcome.email,
              name: outcome.name,
            });
            setBusy(false);
            router.push("/signup/sns");
            return;
          case "needsEmail":
            setContext({
              kind: "emailPending",
              emailToken: outcome.emailToken,
            });
            setBusy(false);
            router.push("/signup/sns");
            return;
          default:
            // 서버가 나아갈 단계를 주지 않았다. 다시 눌러도 같을 가능성이 높다.
            fail("We couldn't continue with LINE. Please try again later.");
        }
      },
      onError: () =>
        fail("We couldn't continue with LINE. Please try again later."),
    });
  };

  return (
    <View>
      <Button
        disabled={busy}
        label={busy ? "Connecting…" : "Continue with LINE"}
        onPress={() => void start()}
        style={{ marginTop: Spacing.tight }}
        variant="secondary"
      />
      {problem ? (
        <View style={{ marginTop: Spacing.tight }}>
          <FieldNote error>{problem}</FieldNote>
        </View>
      ) : null}
    </View>
  );
}
