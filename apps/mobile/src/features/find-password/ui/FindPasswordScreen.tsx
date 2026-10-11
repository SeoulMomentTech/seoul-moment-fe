import { useEffect, useState } from "react";

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { HTTPError } from "ky";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthField } from "@features/auth/ui/AuthField";
import { passwordMeetsRules } from "@shared/lib/utils/password";
import { toTaiwanPhoneNumber } from "@shared/lib/utils/phone";
import { Button } from "@shared/ui/button";
import { Chip, CHIP_GAP } from "@shared/ui/chip";
import { CODE_SENT_MESSAGE, FieldNote, ResendRow } from "@shared/ui/field-note";
import {
  PASSWORD_CHECKLIST_TOP,
  PasswordChecklist,
} from "@shared/ui/password-checklist";
import { Touchable } from "@shared/ui/press";

import { HeaderHeight, Spacing } from "@/constants/theme";

import {
  useResetPassword,
  useSendPasswordEmailCode,
  useSendPasswordPhoneCode,
  useVerifyPasswordEmailCode,
  useVerifyPasswordPhoneCode,
} from "../model/useFindPassword";

// 곁들임 버튼 폭. 가입 화면과 같은 값이라 두 화면의 인증 줄이 같은 자리에서 끊긴다.
const SIDE_BUTTON_WIDTH = 112;
// 재발송 대기. 가입 화면과 같은 60초다 — 웹의 30초는 코드 수명까지 겸하는데,
// 서버가 코드를 정말 30초만 받는지 확인할 길이 없어 여기서는 연타 방지로만 쓴다.
const RESEND_SECONDS = 60;

const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());
// 서버가 주는 코드는 여섯 자리다(swagger: "코드 (6자리)"). 다 치면 버튼 없이 넘어간다.
const CODE_LENGTH = 6;
// +886 을 붙인 뒤의 최소 길이. 대만 휴대폰은 9자리다.
const MIN_PHONE_LENGTH = "+886".length + 9;

type Method = "email" | "phone";

const statusOf = (error: unknown) =>
  (error as HTTPError | null)?.response?.status;

/**
 * 비밀번호 찾기. 웹 FindPasswordPage 와 같은 두 걸음이다 —
 * 가입할 때 쓴 이메일(또는 번호)을 코드로 확인하고, 그 대가로 받은 일회용 토큰으로
 * 새 비밀번호를 건다. 바뀐 뒤에는 세 번째 화면으로 끝을 알린다.
 *
 * 웹은 이 화면을 GuestOnly 로 감싸지만 여기서는 막지 않는다 — 앱의 어디에도
 * 비밀번호를 바꾸는 자리가 따로 없어서, 로그인한 사람에게도 이 길이 유일하다.
 * 일회용 토큰은 Authorization 을 직접 세워 보내므로 로그인 세션과 섞이지 않는다.
 */
export function FindPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [method, setMethod] = useState<Method>("email");
  const [account, setAccount] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [done, setDone] = useState(false);

  const sendEmail = useSendPasswordEmailCode();
  const sendPhone = useSendPasswordPhoneCode();
  const verifyEmail = useVerifyPasswordEmailCode();
  const verifyPhone = useVerifyPasswordPhoneCode();
  const reset = useResetPassword();

  const send = method === "email" ? sendEmail : sendPhone;
  const verify = method === "email" ? verifyEmail : verifyPhone;

  useEffect(() => {
    if (resendIn <= 0) return undefined;

    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const goToLogin = () => {
    // 로그인에서 넘어온 화면이면 되돌아가고, 딥링크로 바로 열렸으면 로그인을 띄운다.
    if (router.canGoBack()) router.back();
    else router.replace("/login");
  };

  /** 방법을 바꾸면 앞서 친 값과 받은 코드는 다른 계정의 것이다. 전부 비운다. */
  const changeMethod = (next: Method) => {
    if (next === method) return;
    setMethod(next);
    setAccount("");
    setCode("");
    setResendIn(0);
    sendEmail.reset();
    sendPhone.reset();
    verifyEmail.reset();
    verifyPhone.reset();
  };

  const normalized =
    method === "email" ? account.trim() : toTaiwanPhoneNumber(account);
  const accountLooksReady =
    method === "email"
      ? looksLikeEmail(account)
      : normalized.length >= MIN_PHONE_LENGTH;

  const requestCode = () => {
    if (method === "email") {
      sendEmail.mutate(normalized, {
        onSuccess: () => setResendIn(RESEND_SECONDS),
      });
      return;
    }
    sendPhone.mutate(normalized, {
      onSuccess: () => setResendIn(RESEND_SECONDS),
    });
  };

  /**
   * 옆 버튼과 자동 제출이 같은 길을 쓴다. 왕복 중에는 다시 보내지 않는다.
   *
   * 값을 인자로 받는 이유가 있다 — 자동 제출은 state 가 갱신되기 전에 불리므로,
   * 여기서 code 를 읽으면 마지막 한 자가 빠진 코드를 보낸다.
   */
  const submitCode = (value: string = code) => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || verify.isPending) return;

    if (method === "email") {
      verifyEmail.mutate(
        { email: normalized, code: trimmed },
        { onSuccess: (res) => setToken(res.data.token) },
      );
      return;
    }
    verifyPhone.mutate(
      { phone: normalized, code: trimmed },
      { onSuccess: (res) => setToken(res.data.token) },
    );
  };

  const submitPassword = () => {
    if (!token) return;
    reset.mutate({ password, token }, { onSuccess: () => setDone(true) });
  };

  const codeSent = send.isSuccess;

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      {/* 로그인·가입과 같은 꼴의 머리라 같은 아래 테두리를 가진다. */}
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
            onPress={goToLogin}
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
            Forgot Password?
          </Text>
          <Text
            className="text-body-3 text-neutral text-center"
            style={{ marginTop: Spacing.tight }}
          >
            {done
              ? "You can sign in with your new password."
              : token
                ? "Choose a new password for your account."
                : "Don't worry! We'll help you reset your password."}
          </Text>

          {done ? (
            <DoneStep onSignIn={goToLogin} />
          ) : token ? (
            <ResetStep
              busy={reset.isPending}
              expired={statusOf(reset.error) === 401}
              failed={reset.isError}
              onChangeConfirm={(value) => {
                setPasswordConfirm(value);
                if (reset.isError) reset.reset();
              }}
              onChangePassword={(value) => {
                setPassword(value);
                if (reset.isError) reset.reset();
              }}
              onRestart={() => {
                // 쓴 코드는 이미 토큰으로 바뀌었다. 첫 걸음의 맨 처음으로 되돌린다 —
                // 발송 상태를 남기면 "코드를 보냈습니다"가 쓸 수 없는 코드를 가리킨다.
                setToken(null);
                setCode("");
                setResendIn(0);
                sendEmail.reset();
                sendPhone.reset();
                verifyEmail.reset();
                verifyPhone.reset();
                reset.reset();
              }}
              onSubmit={submitPassword}
              password={password}
              passwordConfirm={passwordConfirm}
            />
          ) : (
            <VerifyStep
              account={account}
              accountLooksReady={accountLooksReady}
              busySending={send.isPending}
              busyVerifying={verify.isPending}
              code={code}
              codeSent={codeSent}
              method={method}
              onChangeAccount={(value) => {
                setAccount(value);
                // 주소를 고치면 앞서 받은 코드는 그 주소의 것이 아니다.
                setCode("");
                setResendIn(0);
                send.reset();
                verify.reset();
              }}
              onChangeCode={(value) => {
                setCode(value);
                verify.reset();
              }}
              onChangeMethod={changeMethod}
              onRequestCode={requestCode}
              onSubmitCode={submitCode}
              resendIn={resendIn}
              sendFailed={send.isError}
              sendStatus={statusOf(send.error)}
              verifyFailed={verify.isError}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface VerifyStepProps {
  method: Method;
  onChangeMethod(next: Method): void;
  account: string;
  onChangeAccount(value: string): void;
  accountLooksReady: boolean;
  code: string;
  onChangeCode(value: string): void;
  codeSent: boolean;
  busySending: boolean;
  busyVerifying: boolean;
  sendFailed: boolean;
  sendStatus?: number;
  verifyFailed: boolean;
  resendIn: number;
  onRequestCode(): void;
  onSubmitCode(value?: string): void;
}

/** 첫 걸음. 가입할 때 쓴 이메일 또는 번호를 코드로 확인한다. */
function VerifyStep({
  method,
  onChangeMethod,
  account,
  onChangeAccount,
  accountLooksReady,
  code,
  onChangeCode,
  codeSent,
  busySending,
  busyVerifying,
  sendFailed,
  sendStatus,
  verifyFailed,
  resendIn,
  onRequestCode,
  onSubmitCode,
}: VerifyStepProps) {
  return (
    <>
      {/* 웹은 밑줄 탭으로 가르지만, 이 앱에서 "둘 중 하나 고르기"의 생김새는 칩 하나뿐이다.
          탭이라 고른 것을 다시 눌러도 비워지지 않는다. */}
      <View
        className="flex-row justify-center"
        style={{ marginTop: Spacing.section, gap: CHIP_GAP }}
      >
        <Chip
          label="Email"
          onPress={() => onChangeMethod("email")}
          selected={method === "email"}
        />
        <Chip
          label="Mobile Number"
          onPress={() => onChangeMethod("phone")}
          selected={method === "phone"}
        />
      </View>

      <Text
        className="text-body-3 text-neutral text-center"
        style={{ marginTop: Spacing.inner }}
      >
        {method === "email"
          ? "Please enter the email address you used when signing up."
          : "Please enter the mobile number you used when signing up."}
      </Text>

      <View style={{ marginTop: Spacing.inner, gap: Spacing.tight }}>
        <AuthField
          autoComplete={method === "email" ? "email" : undefined}
          keyboardType={method === "email" ? "email-address" : "number-pad"}
          onChangeText={onChangeAccount}
          placeholder={method === "email" ? "Email" : "Mobile number"}
          value={account}
        />

        {/* 인증 줄은 늘 자리를 지킨다. 발송 후에만 나타나게 하면 그 순간 아래가 전부 밀린다. */}
        <View className="flex-row" style={{ gap: Spacing.tight }}>
          <View className="flex-1">
            <AuthField
              invalid={verifyFailed}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              onChangeText={onChangeCode}
              onComplete={onSubmitCode}
              otp={method === "email" ? "email" : "sms"}
              placeholder="Verification Code"
              value={code}
            />
          </View>
          {codeSent ? (
            // 코드를 받은 뒤 옆 버튼이 맡는 일은 검증 하나다. 다시 받는 길은 아래 줄에 둔다 —
            // 버튼 하나가 발송과 검증을 번갈아 맡으면 코드가 안 왔을 때 길이 사라진다.
            <Button
              disabled={code.trim().length === 0 || busyVerifying}
              label="Verify"
              // 인자 없이 부른다 — Pressable 은 제스처 이벤트를 넘기는데,
              // 그것이 코드 값 자리에 들어오면 trim() 에서 터진다.
              onPress={() => onSubmitCode()}
              style={{ width: SIDE_BUTTON_WIDTH }}
              variant="secondary"
            />
          ) : (
            <Button
              disabled={!accountLooksReady || busySending}
              label="Send Code"
              onPress={onRequestCode}
              style={{ width: SIDE_BUTTON_WIDTH }}
              variant="secondary"
            />
          )}
        </View>
      </View>

      <VerifyNote
        busy={busySending}
        codeSent={codeSent}
        method={method}
        onResend={onRequestCode}
        resendIn={resendIn}
        sendFailed={sendFailed}
        sendStatus={sendStatus}
        verifyFailed={verifyFailed}
      />
    </>
  );
}

/** 인증 줄 아래. 실패는 제 줄을 갖고, 보냄·다시 보내기는 한 줄을 나눠 쓴다. */
function VerifyNote({
  method,
  sendFailed,
  sendStatus,
  verifyFailed,
  codeSent,
  resendIn,
  busy,
  onResend,
}: {
  method: Method;
  sendFailed: boolean;
  sendStatus?: number;
  verifyFailed: boolean;
  codeSent: boolean;
  resendIn: number;
  busy: boolean;
  onResend(): void;
}) {
  if (sendFailed) {
    // 보내지 못했으면 다시 보내기 줄을 두지 않는다 — 옆 버튼이 아직 "Send Code" 다.
    return (
      <View style={{ marginTop: Spacing.tight }}>
        <FieldNote error>
          {sendStatus === 404
            ? method === "email"
              ? "We couldn't find an account with that email."
              : "We couldn't find an account with that number."
            : "We couldn't send the code. Please try again."}
        </FieldNote>
      </View>
    );
  }

  if (verifyFailed) {
    return (
      <View style={{ marginTop: Spacing.tight, gap: Spacing.tight }}>
        <FieldNote error>
          The verification code does not match, or it has expired.
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

/** 두 번째 걸음. 검증이 준 일회용 토큰으로 새 비밀번호를 건다. */
function ResetStep({
  password,
  passwordConfirm,
  onChangePassword,
  onChangeConfirm,
  busy,
  failed,
  expired,
  onSubmit,
  onRestart,
}: {
  password: string;
  passwordConfirm: string;
  onChangePassword(value: string): void;
  onChangeConfirm(value: string): void;
  busy: boolean;
  failed: boolean;
  expired: boolean;
  onSubmit(): void;
  onRestart(): void;
}) {
  const matches = password.length > 0 && password === passwordConfirm;
  const canSubmit = passwordMeetsRules(password) && matches && !busy;

  return (
    <>
      <View style={{ marginTop: Spacing.section, gap: Spacing.tight }}>
        <AuthField
          autoComplete="new-password"
          onChangeText={onChangePassword}
          placeholder="Enter Password"
          secureTextEntry
          value={password}
        />
        <AuthField
          autoComplete="new-password"
          onChangeText={onChangeConfirm}
          placeholder="Re-enter Password"
          secureTextEntry
          value={passwordConfirm}
        />
      </View>

      <View style={{ marginTop: PASSWORD_CHECKLIST_TOP }}>
        <PasswordChecklist value={password} />
      </View>

      <View style={{ marginTop: Spacing.tight }}>
        {expired ? (
          <FieldNote error>
            This reset link has expired. Please verify your account again.
          </FieldNote>
        ) : failed ? (
          <FieldNote error>
            We couldn&apos;t change your password. Please try again.
          </FieldNote>
        ) : password.length > 0 && !matches ? (
          <FieldNote>The two passwords don&apos;t match.</FieldNote>
        ) : null}
      </View>

      {expired ? (
        <Button
          label="Start over"
          onPress={onRestart}
          style={{ marginTop: Spacing.tight }}
        />
      ) : (
        <Button
          accessibilityLabel="Change password"
          disabled={!canSubmit}
          label={busy ? "Saving…" : "Change password"}
          onPress={onSubmit}
          style={{ marginTop: Spacing.tight }}
        />
      )}
    </>
  );
}

/**
 * 끝. 바뀌었다고 말하고 끝낸다 — 말없이 화면을 닫으면 바뀐 것인지 취소된 것인지 알 수 없다.
 */
function DoneStep({ onSignIn }: { onSignIn(): void }) {
  return (
    <View style={{ marginTop: Spacing.section }}>
      <Text className="text-body-2 text-foreground text-center font-bold">
        Your password has been changed.
      </Text>
      <Button
        label="Sign in"
        onPress={onSignIn}
        style={{ marginTop: Spacing.inner }}
      />
    </View>
  );
}
