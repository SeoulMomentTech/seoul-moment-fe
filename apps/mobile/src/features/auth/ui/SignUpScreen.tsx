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

import { passwordMeetsRules } from "@shared/lib/utils/password";
import { Button } from "@shared/ui/button";
import { CODE_SENT_MESSAGE, FieldNote, ResendRow } from "@shared/ui/field-note";
import {
  PASSWORD_CHECKLIST_TOP,
  PasswordChecklist,
} from "@shared/ui/password-checklist";
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
const NICKNAME_RULE = /^[A-Za-z0-9]{2,20}$/;
// 서버가 주는 코드는 여섯 자리다. 다 치면 버튼 없이 넘어간다.
const CODE_LENGTH = 6;

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

  /** 옆 버튼과 자동 제출이 같은 길을 쓴다. 왕복 중에는 다시 보내지 않는다. */
  const submitCode = (value: string = code) => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || verifyCode.isPending) return;

    verifyCode.mutate(
      { email: email.trim(), code: trimmed },
      { onSuccess: (res) => setVerified(res.success) },
    );
  };

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
      : !passwordMeetsRules(password)
        ? "Your password needs to meet all five rules below."
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
                  invalid={codeRejected}
                  keyboardType="number-pad"
                  maxLength={CODE_LENGTH}
                  onChangeText={(value) => {
                    setCode(value);
                    verifyCode.reset();
                    clearSubmitErrors();
                  }}
                  onComplete={submitCode}
                  otp="email"
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
                  onPress={() => submitCode()}
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

          {/* 규칙은 치는 동안 보여야 뜻이 있다 — 버튼 위 한 줄로만 말하면
              무엇이 모자란지 다섯 중 어느 것인지 알 수 없다. */}
          <View style={{ marginTop: PASSWORD_CHECKLIST_TOP }}>
            <PasswordChecklist value={password} />
          </View>

          {/* 이메일 쪽 서버 응답만 칸 가까이 둔다. 나머지 규칙은 버튼 위 한 줄이 맡는다. */}
          <EmailNote
            busy={sendCode.isPending}
            codeRejected={codeRejected}
            codeSent={codeSent}
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
              <FieldNote error>
                We couldn&apos;t create your account. Please try again.
              </FieldNote>
            ) : validateNickname.isError ? (
              <FieldNote error>That nickname is taken. Try another.</FieldNote>
            ) : login.isError ? (
              <FieldNote error>
                Your account is ready. Please sign in.
              </FieldNote>
            ) : blocker ? (
              <FieldNote>{blocker}</FieldNote>
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
 * 인증 줄 아래. 실패는 제 줄을 갖고, 보냄·다시 보내기는 한 줄을 나눠 쓴다.
 * 보낸 주소를 되풀이하지 않는 것은 바로 위 칸에 그대로 적혀 있기 때문이다.
 */
function EmailNote({
  sendFailed,
  codeSent,
  codeRejected,
  verified,
  resendIn,
  busy,
  onResend,
}: {
  sendFailed: boolean;
  codeSent: boolean;
  codeRejected: boolean;
  verified: boolean;
  resendIn: number;
  busy: boolean;
  onResend(): void;
}) {
  if (verified) return null;

  if (sendFailed) {
    // 보내지 못했으면 다시 보내기 줄을 두지 않는다 — 옆 버튼이 아직 "Send Code" 다.
    return (
      <View style={{ marginTop: Spacing.tight }}>
        <FieldNote error>
          That email is already registered, or the code couldn&apos;t be sent.
        </FieldNote>
      </View>
    );
  }

  if (codeRejected) {
    return (
      <View style={{ marginTop: Spacing.tight, gap: Spacing.tight }}>
        <FieldNote error>
          The verification code does not match. Please check and try again.
        </FieldNote>
        <ResendRow busy={busy} onResend={onResend} secondsLeft={resendIn} />
      </View>
    );
  }

  if (codeSent) {
    return (
      <View style={{ marginTop: Spacing.tight }}>
        <ResendRow
          busy={busy}
          message={CODE_SENT_MESSAGE}
          onResend={onResend}
          secondsLeft={resendIn}
        />
      </View>
    );
  }

  return null;
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
