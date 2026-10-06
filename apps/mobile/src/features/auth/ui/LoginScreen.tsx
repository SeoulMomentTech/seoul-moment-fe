import { useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLoginMutation } from "../model/useLoginMutation";

const HEADER_HEIGHT = 52;
const INPUT_HEIGHT = 52;
// 워드마크 logo.png 는 533x65. 웹 로그인 헤더(204x24)와 같은 크기로 쓴다.
const LOGO_WIDTH = 204;
const LOGO_HEIGHT = 24;
// placeholder 는 className 을 못 받는다. --neutral-600 값.
const PLACEHOLDER_COLOR = "#707070";

// 비어 보이지 않을 정도의 최소 검사만 한다. 진짜 판정은 서버가 한다.
const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

/**
 * 로그인. 블록 구성은 web LoginPage 와 같다 —
 * 헤더 / 폼 / 약관 동의 문구 / 소셜 / 가입 유도.
 * 문구도 web 의 영문 메시지를 그대로 쓴다.
 */
export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useLoginMutation({ onSuccess: () => router.back() });

  const canSubmit =
    looksLikeEmail(email) && password.length > 0 && !mutation.isPending;

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
            paddingBottom: insets.bottom + 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LoginHeader />

          <View className="pt-9" style={{ gap: 14 }}>
            <Field
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Please enter your email address."
              value={email}
            />
            <Field
              autoComplete="current-password"
              onChangeText={setPassword}
              placeholder="Please enter your password."
              secureTextEntry
              value={password}
            />
            {/* 웹에는 /find-password 가 있지만 앱에는 아직 없어 링크를 걸지 않는다. */}
          </View>

          {mutation.isError ? (
            <Text className="text-body-3 text-brand mt-4">
              Please check your email or password.
            </Text>
          ) : null}

          <Pressable
            accessibilityLabel="Login"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            className="bg-foreground mt-8 items-center justify-center rounded-lg py-4"
            disabled={!canSubmit}
            onPress={() => mutation.mutate({ email: email.trim(), password })}
            style={!canSubmit ? { opacity: 0.35 } : undefined}
          >
            <Text className="text-body-2 text-background font-bold">
              {mutation.isPending ? "Logging in…" : "Login"}
            </Text>
          </Pressable>

          <LoginTerms onPressTerms={() => router.push("/terms")} />

          {/* 소셜 로그인 자리. 네이티브 SDK·클라이언트 ID·dev build 가 필요해 아직 없다. */}
          <Text className="text-body-3 text-neutral mt-8 text-center">
            Social sign-in is coming soon.
          </Text>

          <Register />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function LoginHeader() {
  return (
    <View className="items-center pt-6" style={{ gap: 16 }}>
      <Image
        accessibilityLabel="Seoul Moment"
        contentFit="contain"
        source={require("@/assets/images/logo.png")}
        style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
      />
      <Text className="text-body-3 text-neutral text-center">
        Welcome to Seoul Moment.
      </Text>
    </View>
  );
}

function LoginTerms({ onPressTerms }: { onPressTerms(): void }) {
  return (
    <View className="pt-5" style={{ gap: 10 }}>
      <Text className="text-body-3 text-foreground text-center">
        By logging in, you agree to the terms below of Seoul Moment.
      </Text>
      <Pressable
        accessibilityLabel="Terms of Service and Privacy Policy"
        accessibilityRole="button"
        hitSlop={14}
        onPress={onPressTerms}
      >
        <Text
          className="text-body-3 text-neutral text-center"
          style={{ textDecorationLine: "underline" }}
        >
          Terms of Service and Privacy Policy
        </Text>
      </Pressable>
    </View>
  );
}

/** 가입 화면이 아직 없어 안내만 둔다. 웹은 여기서 /signup 으로 보낸다. */
function Register() {
  return (
    <View className="border-neutral-subtle mt-10 border-t pt-10">
      <Text className="text-body-3 text-neutral text-center">
        Don&apos;t have a Seoul Moment account? Sign-up is coming soon.
      </Text>
    </View>
  );
}

function Field({
  ...input
}: {
  value: string;
  placeholder: string;
  onChangeText(text: string): void;
  secureTextEntry?: boolean;
  keyboardType?: "email-address";
  autoComplete?: "email" | "current-password";
}) {
  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      className="border-neutral-subtle text-body-2 text-foreground rounded-lg border px-4"
      placeholderTextColor={PLACEHOLDER_COLOR}
      style={{ height: INPUT_HEIGHT }}
      {...input}
    />
  );
}
