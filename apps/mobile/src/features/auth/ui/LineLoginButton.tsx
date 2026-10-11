import { useState } from "react";

import { useRouter } from "expo-router";
import { Alert, Text, View } from "react-native";

import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import { BUTTON_HEIGHT } from "@shared/ui/button";
import { FieldNote } from "@shared/ui/field-note";
import { Touchable } from "@shared/ui/press";

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
 * LINE 로그인 버튼의 색. **LINE 의 버튼 가이드라인이 정한 값이라 바꾸지 않는다** —
 * 바탕 #06C755 에 흰 글자, 누르면 그 위에 검정 30% 를 덮는다(= #048B3B).
 *
 * 흰 글자 / 초록 바탕은 2.26:1 로 본문 기준(4.5)에 못 미친다. 알고 두는 것이다 —
 * 이 버튼은 LINE 의 자산이고, 색을 고치는 쪽이 가이드라인 위반이다.
 *
 * 로고는 넣지 않았다. 가이드라인이 "다른 아이콘이나 고친 아이콘으로 바꾸지 말 것"을
 * 명시하므로 비슷하게 그려 넣을 수 없고, 공식 템플릿의 아이콘 파일이 있어야 한다.
 */
const LINE_GREEN = "#06C755";
const LINE_GREEN_PRESSED = "#048B3B";

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
      {/* 공용 Button 을 쓰지 않는다 — 색도 누름 표현도 LINE 이 정해 둔 것이라
          variant 하나로 섞을 수 있는 종류가 아니다. */}
      <Touchable
        accessibilityLabel="Continue with LINE"
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
        className="items-center justify-center rounded-full"
        disabled={busy}
        // 누름은 투명도가 아니라 검정 30% 덮기다. 투명도로 하면 흰 바탕 위에서
        // 초록이 옅어져, 가이드라인이 말하는 "어두워지는" 것과 반대가 된다.
        feedback="none"
        onPress={() => void start()}
        style={({ pressed }) => ({
          height: BUTTON_HEIGHT.lg,
          marginTop: Spacing.tight,
          backgroundColor: pressed ? LINE_GREEN_PRESSED : LINE_GREEN,
          opacity: busy ? 0.6 : 1,
        })}
      >
        <Text className="text-body-2 font-bold" style={{ color: "#FFFFFF" }}>
          {busy ? "Connecting…" : "Continue with LINE"}
        </Text>
      </Touchable>
      {problem ? (
        <View style={{ marginTop: Spacing.tight }}>
          <FieldNote error>{problem}</FieldNote>
        </View>
      ) : null}
    </View>
  );
}
