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

import { Button } from "@shared/ui/button";
import { Touchable } from "@shared/ui/press";

import { HeaderHeight, Spacing } from "@/constants/theme";

import { AUTH_FIELD_HEIGHT, AuthField } from "./AuthField";
import {
  allTermsAgreed,
  NO_TERMS_AGREED,
  TermsConsent,
  type TermsAgreed,
} from "./TermsConsent";
import { useLoginMutation } from "../model/useLoginMutation";
import {
  useSendEmailCode,
  useSignUp,
  useValidateNickname,
  useVerifyEmailCode,
} from "../model/useSignUp";

// 곁들임 버튼 폭을 고정한다. 글자에 맡기면 "Send code" ↔ "Resend" 에서 입력칸이 들썩인다.
const SIDE_BUTTON_WIDTH = 112;
// 재발송 대기. 연타로 메일이 쏟아지는 것을 막는다 (web 과 같은 60초).
const RESEND_SECONDS = 60;

const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());
// 웹과 같은 규칙. 자세한 판정은 서버가 한다.
const MIN_PASSWORD = 8;
const NICKNAME_RULE = /^[A-Za-z0-9]{2,20}$/;

/**
 * 이메일 회원가입. 칸 순서와 구성은 web SignupForm 과 같다 —
 * 이메일 / 인증코드+발송 / 닉네임 / 비밀번호 / 확인, 그 아래 약관 동의.
 * 라벨 없이 placeholder 만 쓰는 것도 web 과 같다. 한 번 채우고 끝나는 폼이라
 * 묶음 제목이 다섯 줄을 세 덩어리로 쪼개 오히려 길어 보였다.
 *
 * 가입 응답이 204 라 토큰이 없어, 끝나면 같은 자격증명으로 바로 로그인한다.
 */
export function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [terms, setTerms] = useState<TermsAgreed>(NO_TERMS_AGREED);
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

  // 한 번이라도 코드를 받았으면 그 뒤로는 "검증" 단계다. 재발송은 안내 줄이 맡는다.
  const codeSent = sendCode.isSuccess;
  const codeRejected =
    verifyCode.isError || (verifyCode.isSuccess && !verified);

  /**
   * 값을 고치면 그 값에 대한 지난 실패를 치운다. 남겨 두면 이미 고친 것을 아직
   * 틀린 것처럼 말한다. 가입·로그인 실패는 어느 칸을 고치든 다시 시도할 일이라 함께 지운다.
   */
  const clearSubmitErrors = () => {
    if (signUp.isError) signUp.reset();
    if (login.isError) login.reset();
  };

  /**
   * 지금 가입을 막고 있는 한 가지. 버튼만 흐려 두면 무엇이 모자란지 알 수 없어서,
   * 버튼 바로 위에 그 이유를 적는다. 폼 순서대로 처음 걸리는 것만 말한다 —
   * 모자란 것을 한꺼번에 늘어놓으면 혼내는 것처럼 읽힌다.
   */
  const blocker = !verified
    ? "Verify your email to continue."
    : !NICKNAME_RULE.test(nickname.trim())
      ? "Your nickname can be 2-20 letters and numbers."
      : password.length < MIN_PASSWORD
        ? `Your password needs at least ${MIN_PASSWORD} characters.`
        : password !== passwordConfirm
          ? "The two passwords don't match."
          : !allTermsAgreed(terms)
            ? "Please agree to the terms and the privacy policy."
            : null;

  const canSubmit = blocker == null && !signUp.isPending && !login.isPending;

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
          <Text
            className="text-title-3 text-foreground text-center font-bold"
            style={{ paddingTop: Spacing.inner }}
          >
            Sign Up
          </Text>

          <View style={{ marginTop: Spacing.section, gap: Spacing.tight }}>
            <AuthField
              autoComplete="email"
              editable={!verified}
              keyboardType="email-address"
              onChangeText={(value) => {
                setEmail(value);
                // 이메일을 고치면 앞서 받은 인증은 더 이상 그 주소의 것이 아니다.
                setVerified(false);
                setCode("");
                sendCode.reset();
                verifyCode.reset();
                clearSubmitErrors();
              }}
              placeholder="Email"
              value={email}
            />

            {/* 인증 줄은 늘 자리를 지킨다. 발송 후에만 나타나게 하면 그 순간 아래가 전부 밀린다. */}
            <View className="flex-row" style={{ gap: Spacing.tight }}>
              <View className="flex-1">
                <AuthField
                  editable={!verified}
                  keyboardType="number-pad"
                  onChangeText={(value) => {
                    setCode(value);
                    verifyCode.reset();
                    clearSubmitErrors();
                  }}
                  placeholder="Verification Code"
                  value={code}
                />
              </View>
              {verified ? (
                <Verified />
              ) : codeSent ? (
                // 코드를 받은 뒤 옆 버튼이 맡는 일은 검증 하나다. 다시 받는 길은
                // 아래 안내 줄에 둔다 — 버튼 하나가 발송과 검증을 번갈아 맡으면
                // 메일이 오지 않았을 때 다시 보낼 방법이 사라진다.
                <Button
                  disabled={code.trim().length === 0 || verifyCode.isPending}
                  label="Verify"
                  onPress={() =>
                    verifyCode.mutate(
                      { email: email.trim(), code: code.trim() },
                      { onSuccess: (res) => setVerified(res.success) },
                    )
                  }
                  style={{ width: SIDE_BUTTON_WIDTH }}
                  variant="secondary"
                />
              ) : (
                <Button
                  disabled={!looksLikeEmail(email) || sendCode.isPending}
                  label="Send Code"
                  onPress={send}
                  style={{ width: SIDE_BUTTON_WIDTH }}
                  variant="secondary"
                />
              )}
            </View>

            <AuthField
              onChangeText={(value) => {
                setNickname(value);
                validateNickname.reset();
                clearSubmitErrors();
              }}
              placeholder="Letters and numbers only (2-20)"
              value={nickname}
            />
            <AuthField
              autoComplete="new-password"
              onChangeText={(value) => {
                setPassword(value);
                clearSubmitErrors();
              }}
              placeholder="Password"
              secureTextEntry
              value={password}
            />
            <AuthField
              autoComplete="new-password"
              onChangeText={(value) => {
                setPasswordConfirm(value);
                clearSubmitErrors();
              }}
              placeholder="Confirm Password"
              secureTextEntry
              value={passwordConfirm}
            />
          </View>

          {/* 이메일 쪽 서버 응답만 칸 가까이 둔다. 나머지 규칙은 버튼 위 한 줄이 맡는다. */}
          <EmailNote
            busy={sendCode.isPending}
            codeRejected={codeRejected}
            codeSent={codeSent}
            email={email.trim()}
            onResend={send}
            resendIn={resendIn}
            sendFailed={sendCode.isError}
            verified={verified}
          />

          <View style={{ marginTop: Spacing.section }}>
            <TermsConsent onChange={setTerms} values={terms} />
          </View>

          {/* 서버가 거절한 것이 있으면 그것이 먼저다. 없으면 아직 못 채운 것을 말한다. */}
          <View style={{ marginTop: Spacing.inner }}>
            {signUp.isError ? (
              <Note error>
                We couldn&apos;t create your account. Please try again.
              </Note>
            ) : validateNickname.isError ? (
              <Note error>That nickname is taken. Try another.</Note>
            ) : login.isError ? (
              <Note error>Your account is ready. Please sign in.</Note>
            ) : blocker ? (
              <Note>{blocker}</Note>
            ) : null}
          </View>

          <Button
            accessibilityLabel="Sign Up"
            disabled={!canSubmit}
            label={
              signUp.isPending || login.isPending ? "Creating…" : "Sign Up"
            }
            onPress={submit}
            style={{ marginTop: Spacing.tight }}
          />

          <View
            className="flex-row items-center justify-center"
            style={{ marginTop: Spacing.inner }}
          >
            <Text className="text-body-3 text-neutral">
              Already have an account?{" "}
            </Text>
            <Touchable
              accessibilityLabel="Login"
              accessibilityRole="button"
              hitSlop={14}
              // 로그인에서 넘어온 화면이라 또 쌓지 않고 되돌아간다.
              onPress={() => router.back()}
            >
              <Text
                className="text-body-3 text-foreground"
                style={{ textDecorationLine: "underline" }}
              >
                Login
              </Text>
            </Touchable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * 인증 줄 아래 한 줄. 여러 상태가 한 자리를 나눠 쓰므로 줄이 늘었다 줄지 않는다.
 * 코드를 받은 뒤의 재발송도 여기 있다 — 옆 버튼은 검증을 맡고 있어 자리가 없다.
 */
function EmailNote({
  sendFailed,
  codeSent,
  codeRejected,
  verified,
  email,
  resendIn,
  busy,
  onResend,
}: {
  sendFailed: boolean;
  codeSent: boolean;
  codeRejected: boolean;
  verified: boolean;
  email: string;
  resendIn: number;
  busy: boolean;
  onResend(): void;
}) {
  if (verified) return null;

  if (sendFailed) {
    return (
      <NoteBlock>
        <Note error>
          That email is already registered, or the code couldn&apos;t be sent.
        </Note>
      </NoteBlock>
    );
  }

  if (codeRejected) {
    return (
      <NoteBlock>
        <Note error>
          The verification code does not match. Please check and try again.
        </Note>
      </NoteBlock>
    );
  }

  if (codeSent) {
    return (
      <NoteBlock>
        <Note>The verification code has been sent to {email}.</Note>
        <Resend busy={busy} onPress={onResend} secondsLeft={resendIn} />
      </NoteBlock>
    );
  }

  return null;
}

/** 코드가 오지 않았을 때의 길. 대기 중에는 남은 초를 보여 주고 누르지 못하게 한다. */
function Resend({
  secondsLeft,
  busy,
  onPress,
}: {
  secondsLeft: number;
  busy: boolean;
  onPress(): void;
}) {
  const waiting = secondsLeft > 0 || busy;

  if (waiting) {
    return (
      <Note>
        {busy ? "Sending…" : `You can send it again in ${secondsLeft}s.`}
      </Note>
    );
  }

  return (
    <Touchable
      accessibilityLabel="Send the code again"
      accessibilityRole="button"
      hitSlop={14}
      onPress={onPress}
    >
      <Text
        className="text-body-3 text-foreground"
        style={{ textDecorationLine: "underline" }}
      >
        Didn&apos;t get it? Send it again
      </Text>
    </Touchable>
  );
}

function NoteBlock({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ marginTop: Spacing.tight, gap: Spacing.tight / 2 }}>
      {children}
    </View>
  );
}

/**
 * 한 줄 안내. 실패는 danger 로 말한다 — 브랜드 주황은 선택·이동·주요 동작을
 * 뜻하는 색이라, 같은 색으로 실패까지 말하면 뜻이 겹친다.
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
 * 인증이 끝난 자리. 버튼을 대신해 같은 폭·높이를 채운다.
 * 성공 전용 색은 두지 않는다(팔레트를 늘리지 않는다) — 뜻은 ✓ 와 굵기가 진다.
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
