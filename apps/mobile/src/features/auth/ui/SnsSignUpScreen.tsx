import { useState } from "react";

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

import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import { useTranslations } from "@shared/lib/i18n/useTranslations";
import { Button } from "@shared/ui/button";
import { FieldNote, ResendRow } from "@shared/ui/field-note";
import { Touchable } from "@shared/ui/press";

import { HeaderHeight, Spacing } from "@/constants/theme";

import { AuthField } from "./AuthField";
import {
  allTermsAgreed,
  NO_TERMS_AGREED,
  TermsConsent,
  type TermsAgreed,
} from "./TermsConsent";
import { classifySnsAuthResponse } from "../lib/snsAuthOutcome";
import {
  useLineEmailCode,
  useLineEmailVerify,
  useLineSignUp,
} from "../model/useSnsAuth";
import { useSnsSignUpStore } from "../model/useSnsSignUpStore";

const SIDE_BUTTON_WIDTH = 112;
const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;
const NICKNAME_RULE = /^[A-Za-z0-9]{2,20}$/;

const looksLikeEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value.trim());

/**
 * SNS 가입. 이메일 가입과 달리 비밀번호가 없다 — 신원은 LINE 이 이미 증명했고,
 * 서버가 받는 것은 닉네임과 약관 동의뿐이다.
 *
 * LINE 이 이메일을 주지 않은 경우(채널에 email 승인이 없거나 사용자가 거부)에는
 * 그 앞에 이메일 인증이 한 단계 붙는다. 인증을 통과하면 login 과 **같은 모양**이
 * 돌아오므로 같은 판정을 다시 돌린다 — 이미 연결된 계정이면 거기서 바로 로그인된다.
 */
export function SnsSignUpScreen() {
  const t = useTranslations();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const login = useUserAuthStore((s) => s.login);
  const context = useSnsSignUpStore((s) => s.context);
  const setContext = useSnsSignUpStore((s) => s.set);
  const clearContext = useSnsSignUpStore((s) => s.clear);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState(
    context?.kind === "ready" ? (context.name ?? "") : "",
  );
  const [terms, setTerms] = useState<TermsAgreed>(NO_TERMS_AGREED);
  const [resendIn, setResendIn] = useState(0);

  const sendCode = useLineEmailCode();
  const verifyCode = useLineEmailVerify();
  const signUp = useLineSignUp();

  // 토큰 없이 열린 화면. 딥링크로 바로 들어오면 이렇게 된다.
  if (!context) {
    return (
      <Shell>
        <Text className="text-body-3 text-neutral text-center">
          {t("sns_start_from_sign_in")}
        </Text>
        <Button
          label={t("go_to_sign_in")}
          onPress={() => router.replace("/login")}
          style={{ marginTop: Spacing.inner }}
        />
      </Shell>
    );
  }

  const finish = (token: string, refreshToken: string) => {
    login({ accessToken: token, refreshToken });
    clearContext();
    router.dismissAll();
  };

  const send = () => {
    // 이메일 단계일 때만 부를 수 있다 — 가입 단계에는 보낼 토큰도 받을 주소도 없다.
    if (context.kind !== "emailPending") return;

    sendCode.mutate(
      { emailToken: context.emailToken, email: email.trim() },
      { onSuccess: () => setResendIn(RESEND_SECONDS) },
    );
  };

  const submitCode = (value: string = code) => {
    if (context.kind !== "emailPending") return;
    const trimmed = value.trim();
    if (trimmed.length === 0 || verifyCode.isPending) return;

    verifyCode.mutate(
      { emailToken: context.emailToken, email: email.trim(), code: trimmed },
      {
        onSuccess: (res) => {
          // 같은 판정을 다시 돌린다 — 인증만 통과했을 뿐 어느 갈래인지는 서버가 정한다.
          const outcome = classifySnsAuthResponse(res.data, email.trim());

          if (outcome.kind === "loggedIn") {
            finish(outcome.accessToken, outcome.refreshToken);
            return;
          }
          if (outcome.kind === "readyToSignup") {
            setContext({
              kind: "ready",
              signupToken: outcome.signupToken,
              email: outcome.email,
              name: outcome.name,
            });
            setNickname((current) => current || (outcome.name ?? ""));
          }
          // needsLink·unusable 은 이 화면에서 할 수 있는 일이 없다. 아래 안내가 말한다.
        },
      },
    );
  };

  const ready = context.kind === "ready";

  const blocker = !ready
    ? t("verify_email_to_continue")
    : !NICKNAME_RULE.test(nickname.trim())
      ? t("nickname_rule_hint")
      : !allTermsAgreed(terms)
        ? t("agree_terms_required")
        : null;

  const submit = () => {
    if (!ready || blocker || signUp.isPending) return;

    signUp.mutate(
      { signupToken: context.signupToken, nickname: nickname.trim() },
      { onSuccess: (res) => finish(res.data.token, res.data.refreshToken) },
    );
  };

  return (
    <Shell>
      <Text className="text-title-3 text-foreground text-center font-bold">
        {t("create_your_account")}
      </Text>
      <Text
        className="text-body-3 text-neutral text-center"
        style={{ marginTop: Spacing.tight }}
      >
        {ready && context.email
          ? t("continuing_as", { email: context.email })
          : t("continuing_with_line")}
      </Text>

      <View style={{ marginTop: Spacing.section, gap: Spacing.tight }}>
        {ready ? (
          <AuthField
            onChangeText={(value) => {
              setNickname(value);
              if (signUp.isError) signUp.reset();
            }}
            placeholder={t("allowed_input")}
            value={nickname}
          />
        ) : (
          <>
            {/* LINE 이 이메일을 주지 않았다. 받은 주소로 본인 확인을 한 번 더 한다. */}
            <AuthField
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={(value) => {
                setEmail(value);
                setCode("");
                setResendIn(0);
                sendCode.reset();
                verifyCode.reset();
              }}
              placeholder={t("email")}
              value={email}
            />
            <View className="flex-row" style={{ gap: Spacing.tight }}>
              <View className="flex-1">
                <AuthField
                  invalid={verifyCode.isError}
                  keyboardType="number-pad"
                  maxLength={CODE_LENGTH}
                  onChangeText={(value) => {
                    setCode(value);
                    verifyCode.reset();
                  }}
                  onComplete={submitCode}
                  otp="email"
                  placeholder={t("verification_code")}
                  value={code}
                />
              </View>
              {sendCode.isSuccess ? (
                <Button
                  disabled={code.trim().length === 0 || verifyCode.isPending}
                  label={t("verify")}
                  onPress={() => submitCode()}
                  style={{ width: SIDE_BUTTON_WIDTH }}
                  variant="secondary"
                />
              ) : (
                <Button
                  disabled={!looksLikeEmail(email) || sendCode.isPending}
                  label={t("send_verification_code")}
                  onPress={send}
                  style={{ width: SIDE_BUTTON_WIDTH }}
                  variant="secondary"
                />
              )}
            </View>
          </>
        )}
      </View>

      {ready ? null : (
        <EmailNote
          busy={sendCode.isPending}
          codeSent={sendCode.isSuccess}
          onResend={send}
          rejected={verifyCode.isError}
          resendIn={resendIn}
          sendFailed={sendCode.isError}
        />
      )}

      <View style={{ marginTop: Spacing.section }}>
        <TermsConsent onChange={setTerms} values={terms} />
      </View>

      <View style={{ marginTop: Spacing.inner }}>
        {signUp.isError ? (
          <FieldNote error>{t("nickname_or_account_taken")}</FieldNote>
        ) : blocker ? (
          <FieldNote>{blocker}</FieldNote>
        ) : null}
      </View>

      <Button
        accessibilityLabel={t("create_account")}
        disabled={blocker != null || signUp.isPending}
        label={signUp.isPending ? t("creating_account") : t("create_account")}
        onPress={submit}
        style={{ marginTop: Spacing.tight, marginBottom: insets.bottom }}
      />
    </Shell>
  );
}

/** 로그인·가입과 같은 머리와 같은 본문 틀. */
function Shell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
            accessibilityLabel={t("back")}
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
            paddingTop: Spacing.inner,
            paddingBottom: Spacing.section,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function EmailNote({
  sendFailed,
  rejected,
  codeSent,
  resendIn,
  busy,
  onResend,
}: {
  sendFailed: boolean;
  rejected: boolean;
  codeSent: boolean;
  resendIn: number;
  busy: boolean;
  onResend(): void;
}) {
  const t = useTranslations();

  if (sendFailed) {
    return (
      <View style={{ marginTop: Spacing.tight }}>
        <FieldNote error>{t("code_send_failed")}</FieldNote>
      </View>
    );
  }

  if (rejected) {
    return (
      <View style={{ marginTop: Spacing.tight, gap: Spacing.tight }}>
        <FieldNote error>{t("code_not_match")}</FieldNote>
        <ResendRow busy={busy} onResend={onResend} secondsLeft={resendIn} />
      </View>
    );
  }

  if (codeSent) {
    return (
      <View style={{ marginTop: Spacing.tight }}>
        <ResendRow
          busy={busy}
          message={t("verification_code_sent")}
          onResend={onResend}
          secondsLeft={resendIn}
        />
      </View>
    );
  }

  return null;
}
