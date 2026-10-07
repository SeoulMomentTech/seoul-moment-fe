import { useEffect, useState } from "react";

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Touchable } from "@shared/ui/press";

import { AUTH_FIELD_HEIGHT, AuthField } from "./AuthField";
import { GAP_BLOCK, GAP_SECTION, GAP_TIGHT, HEADER_HEIGHT } from "./layout";
import { useLoginMutation } from "../model/useLoginMutation";
import {
  useSendEmailCode,
  useSignUp,
  useValidateNickname,
  useVerifyEmailCode,
} from "../model/useSignUp";

// 곁들임 버튼 폭을 고정한다. 글자에 맡기면 "Send code" ↔ "Resend" 에서 입력칸이 들썩인다.
const SIDE_BUTTON_WIDTH = 104;
// 재발송 대기. 연타로 메일이 쏟아지는 것을 막는다 (web 과 같은 60초).
const RESEND_SECONDS = 60;

const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());
// 웹과 같은 최소 길이. 자세한 규칙은 서버가 판정한다.
const MIN_PASSWORD = 8;

/**
 * 이메일 회원가입. 웹 SignupForm 과 같은 순서다 —
 * 이메일 인증(코드 발송 → 검증) → 비밀번호 → 닉네임 중복 검사 → 가입.
 * 가입 응답이 204 라 토큰이 없어, 끝나면 같은 자격증명으로 바로 로그인한다.
 *
 * 세 묶음(이메일 / 비밀번호 / 닉네임)으로 나눠 긴 한 줄짜리 폼으로 보이지 않게 했다.
 */
export function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const sendCode = useSendEmailCode();
  const verifyCode = useVerifyEmailCode();
  const validateNickname = useValidateNickname();
  const signUp = useSignUp();
  // 가입은 204 라 토큰을 주지 않는다. 가입 직후 로그인해 바로 들어가게 한다.
  const login = useLoginMutation({ onSuccess: () => router.dismissAll() });

  useEffect(() => {
    if (resendIn <= 0) return undefined;

    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const send = () =>
    sendCode.mutate(email.trim(), {
      onSuccess: () => setResendIn(RESEND_SECONDS),
    });

  const codeRejected =
    verifyCode.isError || (verifyCode.isSuccess && !verified);
  const passwordTooShort =
    password.length > 0 && password.length < MIN_PASSWORD;
  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;

  const canSubmit =
    verified &&
    password.length >= MIN_PASSWORD &&
    password === passwordConfirm &&
    nickname.trim().length > 0 &&
    !signUp.isPending &&
    !login.isPending;

  const submit = () => {
    if (!canSubmit) return;

    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();

    validateNickname.mutate(trimmedNickname, {
      onSuccess: () =>
        signUp.mutate(
          { email: trimmedEmail, password, nickname: trimmedNickname },
          { onSuccess: () => login.mutate({ email: trimmedEmail, password }) },
        ),
    });
  };

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top }}>
        <View
          className="flex-row items-center px-5"
          style={{ height: HEADER_HEIGHT }}
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
            paddingBottom: insets.bottom + GAP_SECTION,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-title-3 text-foreground pt-6 font-bold">
            Create your account
          </Text>

          <Group label="Email" style={{ marginTop: GAP_SECTION }}>
            <View className="flex-row" style={{ gap: 8 }}>
              <View className="flex-1">
                <AuthField
                  autoComplete="email"
                  editable={!verified}
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    // 이메일을 고치면 앞서 받은 인증은 더 이상 그 주소의 것이 아니다.
                    setVerified(false);
                    setCode("");
                  }}
                  placeholder="Email"
                  value={email}
                />
              </View>
              {verified ? (
                <Verified />
              ) : (
                <SideButton
                  busy={sendCode.isPending}
                  disabled={!looksLikeEmail(email) || resendIn > 0}
                  label={
                    resendIn > 0
                      ? `${resendIn}s`
                      : sendCode.isSuccess
                        ? "Resend"
                        : "Send code"
                  }
                  onPress={send}
                />
              )}
            </View>

            {sendCode.isError ? (
              <Note error>
                That email is already registered, or the code couldn&apos;t be
                sent.
              </Note>
            ) : null}

            {sendCode.isSuccess && !verified ? (
              <>
                <View className="flex-row" style={{ gap: 8 }}>
                  <View className="flex-1">
                    <AuthField
                      keyboardType="number-pad"
                      onChangeText={setCode}
                      placeholder="Verification code"
                      value={code}
                    />
                  </View>
                  <SideButton
                    busy={verifyCode.isPending}
                    disabled={code.trim().length === 0}
                    label="Verify"
                    onPress={() =>
                      verifyCode.mutate(
                        { email: email.trim(), code: code.trim() },
                        { onSuccess: (res) => setVerified(res.success) },
                      )
                    }
                  />
                </View>
                <Note>We sent a code to {email.trim()}.</Note>
                {codeRejected ? (
                  <Note error>
                    That code didn&apos;t match. Check it and try again.
                  </Note>
                ) : null}
              </>
            ) : null}
          </Group>

          <Group label="Password" style={{ marginTop: GAP_SECTION }}>
            <AuthField
              autoComplete="new-password"
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              value={password}
            />
            <AuthField
              autoComplete="new-password"
              onChangeText={setPasswordConfirm}
              placeholder="Confirm password"
              secureTextEntry
              value={passwordConfirm}
            />
            {passwordMismatch ? (
              <Note error>Passwords don&apos;t match.</Note>
            ) : (
              <Note error={passwordTooShort}>
                At least {MIN_PASSWORD} characters.
              </Note>
            )}
          </Group>

          <Group label="Nickname" style={{ marginTop: GAP_SECTION }}>
            <AuthField
              onChangeText={setNickname}
              placeholder="Nickname"
              value={nickname}
            />
            {validateNickname.isError ? (
              <Note error>That nickname is taken. Try another.</Note>
            ) : null}
          </Group>

          {signUp.isError ? (
            <Note error>
              We couldn&apos;t create your account. Please try again.
            </Note>
          ) : null}
          {login.isError ? (
            <Note error>Account created. Please sign in.</Note>
          ) : null}

          <Touchable
            accessibilityLabel="Create account"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            className="bg-foreground items-center justify-center rounded-lg"
            disabled={!canSubmit}
            onPress={submit}
            style={{
              height: AUTH_FIELD_HEIGHT,
              marginTop: GAP_SECTION,
              opacity: canSubmit ? 1 : 0.3,
            }}
          >
            <Text className="text-body-2 text-background font-bold">
              {signUp.isPending || login.isPending
                ? "Creating…"
                : "Create account"}
            </Text>
          </Touchable>

          <Text
            className="text-body-3 text-neutral text-center"
            style={{ marginTop: GAP_BLOCK, opacity: 0.7 }}
          >
            By creating an account, you agree to our terms.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** 라벨 + 그 아래 입력 묶음. 묶음 안은 항상 GAP_TIGHT 로 붙는다. */
function Group({
  label,
  style,
  children,
}: {
  label: string;
  style?: object;
  children: React.ReactNode;
}) {
  return (
    <View style={style}>
      <Text className="text-body-3 text-neutral mb-2">{label}</Text>
      <View style={{ gap: GAP_TIGHT }}>{children}</View>
    </View>
  );
}

/**
 * 입력 아래 한 줄 안내. 실패는 danger 로 말한다 — 브랜드 주황은 선택·이동·주요
 * 동작을 뜻하는 색이라, 같은 색으로 실패까지 말하면 뜻이 겹친다.
 */
function Note({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <Text
      className={error ? "text-body-3 text-danger" : "text-body-3 text-neutral"}
    >
      {children}
    </Text>
  );
}

/**
 * 인증이 끝난 이메일 옆 표시. 발송 버튼을 대신해 자리를 그대로 채운다.
 * 성공 전용 색은 두지 않는다(팔레트를 늘리지 않는다) — 뜻은 ✓ 와 굵기가 지고,
 * 색은 본문색을 쓴다. 바로 위 실패 줄이 danger 라 둘이 섞이지 않는다.
 */
function Verified() {
  return (
    <View
      className="items-center justify-center"
      style={{ width: SIDE_BUTTON_WIDTH, height: AUTH_FIELD_HEIGHT }}
    >
      <Text className="text-body-3 text-foreground font-bold">✓ Verified</Text>
    </View>
  );
}

function SideButton({
  label,
  disabled,
  busy,
  onPress,
}: {
  label: string;
  disabled: boolean;
  busy: boolean;
  onPress(): void;
}) {
  const off = disabled || busy;

  return (
    <Touchable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: off }}
      className="border-neutral-subtle items-center justify-center rounded-lg border"
      disabled={off}
      onPress={onPress}
      style={{
        width: SIDE_BUTTON_WIDTH,
        height: AUTH_FIELD_HEIGHT,
        opacity: off ? 0.3 : 1,
      }}
    >
      <Text className="text-body-3 text-foreground font-bold">{label}</Text>
    </Touchable>
  );
}
