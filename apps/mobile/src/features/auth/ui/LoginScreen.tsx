import { useState } from "react";

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
// 비어 보이지 않을 정도의 최소 검사만 한다. 진짜 판정은 서버가 한다.
const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

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
      <View
        className="border-neutral-subtle border-b"
        style={{ paddingTop: insets.top }}
      >
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
          <Text className="text-body-2 text-foreground ml-3 flex-1 font-bold">
            Sign in
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 32,
            paddingBottom: insets.bottom + 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Field
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            placeholder="you@example.com"
            value={email}
          />
          <View className="mt-4">
            <Field
              autoComplete="current-password"
              label="Password"
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
            />
          </View>
          {/* 서버 메시지는 로케일이 섞여 오므로 한 줄짜리 공통 문구를 쓴다. */}
          {mutation.isError ? (
            <Text className="text-body-3 text-brand mt-4">
              We couldn&apos;t sign you in. Check your email and password.
            </Text>
          ) : null}
          <Pressable
            accessibilityLabel="Sign in"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            className="bg-foreground mt-8 items-center justify-center rounded-full py-4"
            disabled={!canSubmit}
            onPress={() => mutation.mutate({ email: email.trim(), password })}
            style={!canSubmit ? { opacity: 0.35 } : undefined}
          >
            <Text className="text-body-2 text-background font-bold">
              {mutation.isPending ? "Signing in…" : "Sign in"}
            </Text>
          </Pressable>
          {/* 소셜 로그인은 네이티브 SDK 와 클라이언트 ID 가 필요해 아직 없다. */}
          <Text className="text-body-3 text-neutral mt-8 text-center">
            Social sign-in is coming soon.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  ...input
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText(text: string): void;
  secureTextEntry?: boolean;
  keyboardType?: "email-address";
  autoComplete?: "email" | "current-password";
}) {
  return (
    <View>
      <Text className="text-body-3 text-neutral mb-2">{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        className="border-neutral-subtle text-body-2 text-foreground rounded-lg border px-4"
        placeholderTextColor="#707070"
        style={{ height: INPUT_HEIGHT }}
        {...input}
      />
    </View>
  );
}
