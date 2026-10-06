import { useRef, useState } from "react";

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
const INPUT_HEIGHT = 56;
// 입력칸 안쪽 좌우 여백. 56 높이에 16 은 글자가 테두리에 붙어 보여 화면 좌우 여백(20)과 맞춘다.
const INPUT_PADDING_X = 20;

// 블록 사이 간격을 하나의 스케일로 둔다. 전에는 블록마다 그때그때 붙인 값이라 리듬이 없었다.
const GAP_TIGHT = 12; // 입력칸 사이
const GAP_BLOCK = 24; // 블록 안쪽
const GAP_SECTION = 40; // 블록 사이

// 워드마크 logo.png 는 533x65. 상단에 무게를 주려고 웹(204x24)보다 키운다.
const LOGO_WIDTH = 240;
const LOGO_HEIGHT = 29;

// TextInput 의 placeholderTextColor 와 테두리 색은 className 을 받지 못해 토큰 값을 직접 쓴다.
const PLACEHOLDER_COLOR = "#707070"; // --neutral-600 (= text-neutral)
const BORDER_IDLE = "#dddddd"; // --neutral-200 (= border-neutral-subtle)
const BORDER_FOCUS = "#f37b2a"; // --brand-500

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
            <Field
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              onSubmitEditing={() => passwordRef.current?.focus()}
              placeholder="Email"
              returnKeyType="next"
              value={email}
            />
            <Field
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
              height: INPUT_HEIGHT,
              marginTop: GAP_BLOCK,
              opacity: canSubmit ? 1 : 0.3,
            }}
          >
            <Text className="text-body-2 text-background font-bold">
              {mutation.isPending ? "Logging in…" : "Login"}
            </Text>
          </Pressable>

          <View style={{ marginTop: GAP_BLOCK, gap: 8 }}>
            <Text className="text-body-3 text-neutral text-center">
              By logging in, you agree to the terms below of Seoul Moment.
            </Text>
            <Pressable
              accessibilityLabel="Terms of Service and Privacy Policy"
              accessibilityRole="button"
              hitSlop={14}
              onPress={() => router.push("/terms")}
            >
              <Text
                className="text-body-3 text-foreground text-center"
                style={{ textDecorationLine: "underline" }}
              >
                Terms of Service and Privacy Policy
              </Text>
            </Pressable>
          </View>

          {/* 아직 없는 기능(소셜 로그인·가입)은 화면을 차지하지 않게 맨 아래 한 줄로 모은다. */}
          <Text
            className="text-body-3 text-neutral text-center"
            style={{ marginTop: GAP_SECTION, opacity: 0.7 }}
          >
            Social sign-in and sign-up are coming soon.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface FieldProps {
  value: string;
  placeholder: string;
  onChangeText(text: string): void;
  onSubmitEditing?(): void;
  returnKeyType?: "next" | "go";
  secureTextEntry?: boolean;
  keyboardType?: "email-address";
  autoComplete?: "email" | "current-password";
  inputRef?: React.RefObject<TextInput | null>;
}

function Field({ inputRef, ...input }: FieldProps) {
  // 포커스 테두리가 없으면 어느 칸에 타이핑 중인지 알 수 없다. 테두리 색은
  // className 으로 못 바꾸므로(동적 값) style 로 준다.
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      className="bg-surface-muted text-body-2 text-foreground rounded-lg"
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      placeholderTextColor={PLACEHOLDER_COLOR}
      ref={inputRef}
      style={{
        height: INPUT_HEIGHT,
        paddingHorizontal: INPUT_PADDING_X,
        borderWidth: 1,
        borderColor: focused ? BORDER_FOCUS : BORDER_IDLE,
      }}
      submitBehavior="submit"
      {...input}
    />
  );
}
