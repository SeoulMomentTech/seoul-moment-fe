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
import { useLoginMutation } from "../model/useLoginMutation";

// 워드마크 logo.png 는 533x65. 상단에 무게를 주려고 웹(204x24)보다 키운다.
const LOGO_WIDTH = 240;
const LOGO_HEIGHT = 29;

// 비어 보이지 않을 정도의 최소 검사만 한다. 진짜 판정은 서버가 한다.
const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

/**
 * 로그인. 블록 구성은 web LoginPage 를 따르되(헤더 / 폼 / 약관 / 소셜 / 가입)
 * 폰에 맞게 다듬었다 — 아직 없는 기능의 안내는 맨 아래 한 줄로 모으고,
 * 포커스 테두리와 키보드 넘김을 더했다.
 * 문구는 web 의 영문 메시지를 쓰되 placeholder 만 짧게 줄였다.
 */
export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<TextInput>(null);

  const mutation = useLoginMutation({ onSuccess: () => router.back() });

  const canSubmit =
    looksLikeEmail(email) && password.length > 0 && !mutation.isPending;

  const submit = () => {
    if (canSubmit) mutation.mutate({ email: email.trim(), password });
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
              onChangeText={setEmail}
              onSubmitEditing={() => passwordRef.current?.focus()}
              placeholder="Email"
              returnKeyType="next"
              value={email}
            />
            <AuthField
              autoComplete="current-password"
              inputRef={passwordRef}
              onChangeText={setPassword}
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

          {/* 약관 동의 문구는 두지 않는다 — 로그인은 동의를 받는 자리가 아니고,
              약관은 가입 화면과 My > Help 에서 볼 수 있다. */}
          <Button
            label="Sign up with email"
            onPress={() => router.push("/signup")}
            // 로그인과 짝을 이루는 선택지라 섹션 간격(40)이 아니라 가까이 붙인다.
            style={{ marginTop: Spacing.tight }}
            variant="secondary"
          />

          {/* 소셜 로그인만 아직 없다. 화면을 차지하지 않게 한 줄로 둔다. */}
          <Text
            className="text-body-3 text-neutral text-center"
            style={{ marginTop: Spacing.inner, opacity: 0.7 }}
          >
            Social sign-in is coming soon.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
