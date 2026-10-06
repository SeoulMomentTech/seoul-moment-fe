import { useRef, useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { TextInput } from "react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AUTH_FIELD_HEIGHT, AuthField } from "./AuthField";
import { GAP_BLOCK, GAP_SECTION, GAP_TIGHT, HEADER_HEIGHT } from "./layout";
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
      <View style={{ paddingTop: insets.top }}>
        <View
          className="flex-row items-center px-5"
          style={{ height: HEADER_HEIGHT }}
        >
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={14}
            onPress={() => router.back()}
          >
            <Text className="text-title-4 text-foreground font-bold">‹</Text>
          </Pressable>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + GAP_SECTION,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center" style={{ paddingTop: GAP_SECTION }}>
            <Image
              accessibilityLabel="Seoul Moment"
              contentFit="contain"
              source={require("@/assets/images/logo.png")}
              style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
            />
            <Text
              className="text-body-3 text-neutral text-center"
              style={{ marginTop: GAP_TIGHT }}
            >
              Welcome to Seoul Moment.
            </Text>
          </View>

          <View style={{ marginTop: GAP_SECTION, gap: GAP_TIGHT }}>
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
              className="text-body-3 text-brand"
              style={{ marginTop: GAP_TIGHT }}
            >
              Please check your email or password.
            </Text>
          ) : null}

          <Pressable
            accessibilityLabel="Login"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            className="bg-foreground items-center justify-center rounded-lg"
            disabled={!canSubmit}
            onPress={submit}
            style={{
              height: AUTH_FIELD_HEIGHT,
              marginTop: GAP_BLOCK,
              opacity: canSubmit ? 1 : 0.3,
            }}
          >
            <Text className="text-body-2 text-background font-bold">
              {mutation.isPending ? "Logging in…" : "Login"}
            </Text>
          </Pressable>

          {/* 약관 동의 문구는 두지 않는다 — 로그인은 동의를 받는 자리가 아니고,
              약관은 가입 화면과 My > Help 에서 볼 수 있다. */}
          <Pressable
            accessibilityLabel="Sign up with email"
            accessibilityRole="button"
            className="border-neutral-subtle items-center justify-center rounded-lg border"
            onPress={() => router.push("/signup")}
            // 로그인과 짝을 이루는 선택지라 블록 간격(40)이 아니라 가까이 붙인다.
            style={{ height: AUTH_FIELD_HEIGHT, marginTop: GAP_TIGHT }}
          >
            <Text className="text-body-2 text-foreground font-bold">
              Sign up with email
            </Text>
          </Pressable>

          {/* 소셜 로그인만 아직 없다. 화면을 차지하지 않게 한 줄로 둔다. */}
          <Text
            className="text-body-3 text-neutral text-center"
            style={{ marginTop: GAP_BLOCK, opacity: 0.7 }}
          >
            Social sign-in is coming soon.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
