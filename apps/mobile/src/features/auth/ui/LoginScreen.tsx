import { useRef, useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { TextInput } from "react-native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@shared/ui/button";
import { Touchable } from "@shared/ui/press";

import { HeaderHeight, Spacing } from "@/constants/theme";

import { AuthField } from "./AuthField";
import { SocialLoginSection } from "./SocialLoginSection";
import { useLoginMutation } from "../model/useLoginMutation";

// 워드마크 logo.png 는 533x65. 상단에 무게를 주려고 웹(204x24)보다 키운다.
const LOGO_WIDTH = 240;
const LOGO_HEIGHT = 29;

// 비어 보이지 않을 정도의 최소 검사만 한다. 진짜 판정은 서버가 한다.
const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

/**
 * 로그인. 블록 구성은 web LoginPage 를 따르되 폰에 맞게 줄였다 —
 * 워드마크 / 입력 두 칸 / 로그인 / 가입.
 * 문구는 web 의 영문 메시지를 쓰되 placeholder 만 짧게 줄였다.
 *
 * 아직 없는 기능(소셜 로그인)은 알리지 않는다. 화면의 마지막 자리는 다음에 할 일이
 * 차지해야 하고, 보여 준 적 없는 것을 아쉬워하는 사람은 없다.
 */
export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<TextInput>(null);

  const mutation = useLoginMutation({
    onSuccess: () => {
      // 딥링크로 로그인이 첫 화면이면 돌아갈 곳이 없다. 그때는 탭으로 보낸다 —
      // 없는 뒤로가기를 부르면 성공하고도 로그인 화면에 그대로 남는다.
      if (router.canGoBack()) router.back();
      else router.replace("/my");
    },
  });

  const canSubmit =
    looksLikeEmail(email) && password.length > 0 && !mutation.isPending;

  const submit = () => {
    if (canSubmit) mutation.mutate({ email: email.trim(), password });
  };

  /**
   * 실패 줄은 값을 고치는 순간 치운다. 남겨 두면 비밀번호를 고쳐 놓고도
   * "확인해 보세요" 가 그대로 떠 있어, 이미 고친 것을 아직 틀린 것처럼 말한다.
   */
  const edit = (set: (value: string) => void) => (value: string) => {
    if (mutation.isError) mutation.reset();
    set(value);
  };

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      {/* 약관·앱 헤더와 같은 꼴의 머리라 같은 아래 테두리를 가진다. */}
      <View
        className="border-neutral-subtle border-b"
        style={{ paddingTop: insets.top }}
      >
        <View
          className="flex-row items-center px-5"
          style={{ height: HeaderHeight }}
        >
          <Touchable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={14}
            onPress={() => router.back()}
          >
            <Text className="text-title-4 text-foreground font-bold">‹</Text>
          </Touchable>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + Spacing.section,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="items-center"
            style={{ paddingTop: Spacing.section }}
          >
            <Image
              accessibilityLabel="Seoul Moment"
              contentFit="contain"
              source={require("@/assets/images/logo.png")}
              style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
            />
            <Text
              className="text-body-3 text-neutral text-center"
              style={{ marginTop: Spacing.tight }}
            >
              Welcome to Seoul Moment.
            </Text>
          </View>

          <View style={{ marginTop: Spacing.section, gap: Spacing.tight }}>
            <AuthField
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={edit(setEmail)}
              onSubmitEditing={() => passwordRef.current?.focus()}
              placeholder="Email"
              returnKeyType="next"
              value={email}
            />
            <AuthField
              autoComplete="current-password"
              inputRef={passwordRef}
              onChangeText={edit(setPassword)}
              onSubmitEditing={submit}
              placeholder="Password"
              returnKeyType="go"
              secureTextEntry
              value={password}
            />
          </View>

          {mutation.isError ? (
            <Text
              // 브랜드 주황이 아니라 danger 다. 주황은 고르는 것·갈 수 있는 곳을
              // 뜻하므로, 실패를 같은 색으로 말하면 두 뜻이 섞인다.
              className="text-body-3 text-danger"
              style={{ marginTop: Spacing.tight }}
            >
              Please check your email or password.
            </Text>
          ) : null}

          <Button
            accessibilityLabel="Login"
            disabled={!canSubmit}
            label={mutation.isPending ? "Logging in…" : "Login"}
            onPress={submit}
            style={{ marginTop: Spacing.inner }}
          />

          {/* 비밀번호를 잊은 사람에게는 가입보다 이 길이 먼저다. 로그인 바로 아래에
              붙여, 로그인 묶음의 일부로 읽히게 한다 — 사이에 다른 버튼을 끼우면
              "다시 해 보기"의 연장이라는 뜻이 끊긴다. */}
          <View className="items-center" style={{ marginTop: Spacing.tight }}>
            <Touchable
              accessibilityLabel="Forgot your password"
              accessibilityRole="button"
              hitSlop={14}
              onPress={() => router.push("/find-password")}
            >
              <Text
                className="text-body-3 text-neutral"
                style={{ textDecorationLine: "underline" }}
              >
                Forgot your password?
              </Text>
            </Touchable>
          </View>

          <SocialLoginSection />

          {/* 약관 동의 문구는 두지 않는다 — 로그인은 동의를 받는 자리가 아니고,
              약관은 가입 화면과 My > Help 에서 볼 수 있다.
              가입은 "계정이 없다"는 다른 갈래라 맨 아래에 두되, 섹션 간격(40)까지
              벌리지는 않는다 — 그만큼 비우면 그 자리에 무언가 빠진 것처럼 보인다. */}
          <Button
            label="Sign up with email"
            onPress={() => router.push("/signup")}
            style={{ marginTop: Spacing.inner }}
            variant="secondary"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
