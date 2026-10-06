import { useState } from "react";

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthField } from "./AuthField";
import { useLoginMutation } from "../model/useLoginMutation";
import {
  useSendEmailCode,
  useSignUp,
  useValidateNickname,
  useVerifyEmailCode,
} from "../model/useSignUp";

const HEADER_HEIGHT = 52;
const CONTROL_HEIGHT = 56;
const GAP_TIGHT = 12;
const GAP_BLOCK = 24;
const GAP_SECTION = 40;

const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());
// 웹과 같은 최소 길이. 자세한 규칙은 서버가 판정한다.
const MIN_PASSWORD = 8;

/**
 * 이메일 회원가입. 웹 SignupForm 과 같은 순서다 —
 * 이메일 인증(코드 발송 → 검증) → 비밀번호 → 닉네임 중복 검사 → 가입.
 * 가입 응답이 204 라 토큰이 없어, 끝나면 같은 자격증명으로 바로 로그인한다.
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

  const sendCode = useSendEmailCode();
  const verifyCode = useVerifyEmailCode();
  const validateNickname = useValidateNickname();
  const signUp = useSignUp();
  // 가입은 204 라 토큰을 주지 않는다. 가입 직후 로그인해 바로 들어가게 한다.
  const login = useLoginMutation({ onSuccess: () => router.dismissAll() });

  const passwordsMatch =
    password.length >= MIN_PASSWORD && password === passwordConfirm;
  const canSubmit =
    verified &&
    passwordsMatch &&
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
          {
            email: trimmedEmail,
            password,
            nickname: trimmedNickname,
          },
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
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={14}
            onPress={() => router.back()}
          >
            <Text className="text-title-4 text-foreground font-bold">‹</Text>
          </Pressable>
          <Text className="text-body-2 text-foreground ml-3 flex-1 font-bold">
            Create account
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
            paddingTop: GAP_BLOCK,
            paddingBottom: insets.bottom + GAP_SECTION,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Label text="Email" />
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
                }}
                placeholder="Email"
                value={email}
              />
            </View>
            <SmallButton
              busy={sendCode.isPending}
              disabled={!looksLikeEmail(email) || verified}
              label={sendCode.isSuccess ? "Resend" : "Send code"}
              onPress={() => sendCode.mutate(email.trim())}
            />
          </View>
          <Note
            error={sendCode.isError}
            text={
              sendCode.isError
                ? "That email is already registered, or the code couldn't be sent."
                : sendCode.isSuccess
                  ? "We sent a code to your email."
                  : undefined
            }
          />

          {sendCode.isSuccess && !verified ? (
            <View style={{ marginTop: GAP_TIGHT }}>
              <View className="flex-row" style={{ gap: 8 }}>
                <View className="flex-1">
                  <AuthField
                    keyboardType="number-pad"
                    onChangeText={setCode}
                    placeholder="Verification code"
                    value={code}
                  />
                </View>
                <SmallButton
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
              <Note
                error
                text={
                  verifyCode.isError ||
                  (verifyCode.isSuccess && !verified) ||
                  false
                    ? "That code didn't match. Check it and try again."
                    : undefined
                }
              />
            </View>
          ) : null}

          {verified ? <Note text="Email verified." /> : null}

          <View style={{ marginTop: GAP_BLOCK }}>
            <Label text="Password" />
            <View style={{ gap: GAP_TIGHT }}>
              <AuthField
                autoComplete="new-password"
                onChangeText={setPassword}
                placeholder={`Password (${MIN_PASSWORD}+ characters)`}
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
            </View>
            <Note
              error
              text={
                passwordConfirm.length > 0 && password !== passwordConfirm
                  ? "Passwords don't match."
                  : undefined
              }
            />
          </View>

          <View style={{ marginTop: GAP_BLOCK }}>
            <Label text="Nickname" />
            <AuthField
              onChangeText={setNickname}
              placeholder="Nickname"
              value={nickname}
            />
            <Note
              error
              text={
                validateNickname.isError
                  ? "That nickname is taken. Try another."
                  : undefined
              }
            />
          </View>

          <Note
            error
            text={
              signUp.isError
                ? "We couldn't create your account. Please try again."
                : login.isError
                  ? "Account created. Please sign in."
                  : undefined
            }
          />

          <Pressable
            accessibilityLabel="Create account"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            className="bg-foreground items-center justify-center rounded-lg"
            disabled={!canSubmit}
            onPress={submit}
            style={{
              height: CONTROL_HEIGHT,
              marginTop: GAP_BLOCK,
              opacity: canSubmit ? 1 : 0.3,
            }}
          >
            <Text className="text-body-2 text-background font-bold">
              {signUp.isPending || login.isPending
                ? "Creating…"
                : "Create account"}
            </Text>
          </Pressable>

          <Text
            className="text-body-3 text-neutral text-center"
            style={{ marginTop: GAP_BLOCK }}
          >
            By creating an account, you agree to our terms.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Label({ text }: { text: string }) {
  return <Text className="text-body-3 text-neutral mb-2">{text}</Text>;
}

/** 안내·오류 한 줄. 문구가 없으면 자리도 만들지 않는다. */
function Note({ text, error }: { text?: string; error?: boolean }) {
  if (!text) return null;

  return (
    <Text
      className={error ? "text-body-3 text-brand" : "text-body-3 text-neutral"}
      style={{ marginTop: 8 }}
    >
      {text}
    </Text>
  );
}

function SmallButton({
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
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: off }}
      className="border-neutral-subtle items-center justify-center rounded-lg border px-4"
      disabled={off}
      onPress={onPress}
      style={{ height: CONTROL_HEIGHT, opacity: off ? 0.3 : 1 }}
    >
      <Text className="text-body-3 text-foreground font-bold">{label}</Text>
    </Pressable>
  );
}
