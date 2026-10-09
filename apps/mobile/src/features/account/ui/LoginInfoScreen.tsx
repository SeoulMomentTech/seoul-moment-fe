import { useEffect, useState } from "react";

import { Text, View } from "react-native";

import { useUserInfo } from "@entities/user/model/useUserInfo";
import { AUTH_FIELD_HEIGHT, AuthField } from "@features/auth/ui/AuthField";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import { TAIWAN_DIAL_CODE, toTaiwanPhoneNumber } from "@shared/lib/utils/phone";
import type { UserInfo } from "@shared/services/user";
import { Button } from "@shared/ui/button";
import { Touchable } from "@shared/ui/press";
import { EmptyState, ScreenError } from "@shared/ui/section-state";
import { LoginInfoSkeleton } from "@shared/ui/skeleton";

import { Spacing } from "@/constants/theme";

import {
  AccountBody,
  AccountShell,
  Field,
  FormSection,
  FormSections,
  Note,
  SubmitBar,
  ToggleRow,
} from "./parts";
import {
  useSendPhoneCode,
  useUpdateUserInfo,
  useVerifyPhoneCode,
} from "../model/useAccountInfo";

// 곁들임 버튼 폭. 가입 화면과 같은 값이라 두 화면의 인증 줄이 같은 자리에서 끊긴다.
const SIDE_BUTTON_WIDTH = 112;
// 재발송 대기. 가입 화면과 같은 60초다.
const RESEND_SECONDS = 60;
// 대만 휴대폰 번호는 0 과 국가 코드를 뗀 뒤 9자리다. 8 아래면 보낼 것도 없다.
const MIN_PHONE_DIGITS = 8;

type Agreements = Pick<
  UserInfo,
  "newProductAgreed" | "adAgreed" | "recommendAgreed"
>;

const NOTIFICATION_OPTIONS: {
  key: keyof Agreements;
  title: string;
  description: string;
}[] = [
  {
    key: "newProductAgreed",
    title: "New Arrivals & Promotion Alerts",
    description:
      "Personal Exclusive Offers & Price Drop Alerts for Saved Items",
  },
  {
    key: "adAgreed",
    title: "Marketing & Promotional Emails",
    description: "Ongoing Promotion Notifications",
  },
  {
    key: "recommendAgreed",
    title: "Personalized Product Suggestions",
    description:
      "Personal Exclusive Offers & Price Drop Alerts for Saved Items",
  },
];

const noop = () => {};

const hasEnoughDigits = (phone: string) =>
  toTaiwanPhoneNumber(phone).length >=
  TAIWAN_DIAL_CODE.length + MIN_PHONE_DIGITS;

/**
 * 로그인 정보. web LoginInfoSection 과 같은 것을 같은 순서로 다룬다 —
 * 휴대폰 번호(인증), 바꿀 수 없는 이메일, 그리고 수신 동의 세 개.
 *
 * web 은 번호 인증을 모달 두 장으로 받지만 여기서는 칸 아래에 그대로 펼친다.
 * 폰에서 전체 화면 모달을 띄웠다 닫으면 돌아온 자리가 어디였는지 다시 찾아야 하고,
 * 가입 화면이 이미 같은 모양(코드 칸 + 곁들임 버튼 + 아래 안내 한 줄)을 쓰고 있다.
 */
export function LoginInfoScreen() {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const info = useUserInfo();

  // 쿼리가 꺼져 있으면 isPending 이 영원히 유지되므로 데이터 갈래보다 먼저 거른다.
  if (!isAuthenticated) {
    return (
      <AccountShell>
        <EmptyState
          hint="Sign in from the My tab to manage your account."
          message="You're signed out"
        />
      </AccountShell>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (info.isPending && info.fetchStatus === "paused") {
    return (
      <AccountShell>
        <ScreenError offline onRetry={() => void info.refetch()} />
      </AccountShell>
    );
  }

  if (info.isPending) {
    return (
      <AccountShell>
        <AccountBody title="Login info">
          <LoginInfoSkeleton />
        </AccountBody>
      </AccountShell>
    );
  }

  if (info.isError || !info.data) {
    return (
      <AccountShell>
        <ScreenError onRetry={() => void info.refetch()} />
      </AccountShell>
    );
  }

  return (
    <AccountShell>
      <AccountBody title="Login info">
        {/* 계정이 바뀌면 폼을 새로 시드한다 — 아래 상태는 처음 받은 값에서 출발한다. */}
        <LoginInfoForm info={info.data} key={info.data.email} />
      </AccountBody>
    </AccountShell>
  );
}

function LoginInfoForm({ info }: { info: UserInfo }) {
  const [phone, setPhone] = useState(() => info.phone ?? "");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [agreements, setAgreements] = useState<Agreements>(() => ({
    newProductAgreed: info.newProductAgreed,
    adAgreed: info.adAgreed,
    recommendAgreed: info.recommendAgreed,
  }));

  const sendCode = useSendPhoneCode();
  const verifyCode = useVerifyPhoneCode();
  const updateInfo = useUpdateUserInfo();

  useEffect(() => {
    if (resendIn <= 0) return undefined;

    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const normalizedPhone = toTaiwanPhoneNumber(phone);
  // 계정에 붙어 있는 번호. 서버가 제 꼴로 정규화해 두므로 비교 전에 같은 규칙을 한 번 더 태운다.
  const accountPhone = info.phone ? toTaiwanPhoneNumber(info.phone) : null;
  // "인증됨"은 우리가 들고 있는 깃발이 아니라 서버가 계정에 붙여 둔 번호다.
  // 번호를 한 글자만 고쳐도 저절로 거짓이 되므로, 따로 꺼 줄 곳이 없다.
  const phoneVerified =
    accountPhone != null && normalizedPhone === accountPhone;

  const send = () =>
    sendCode.mutate(normalizedPhone, {
      onSuccess: () => setResendIn(RESEND_SECONDS),
    });

  const codeSent = sendCode.isSuccess;

  const isDirty = NOTIFICATION_OPTIONS.some(
    (option) => agreements[option.key] !== info[option.key],
  );

  return (
    <>
      <FormSections>
        <FormSection title="My Account">
          <Field label="Mobile Number">
            <View style={{ gap: Spacing.tight }}>
              <AuthField
                keyboardType="number-pad"
                onChangeText={(value) => {
                  setPhone(value);
                  // 번호를 고치면 앞서 받은 코드는 더 이상 그 번호의 것이 아니다.
                  setCode("");
                  sendCode.reset();
                  verifyCode.reset();
                }}
                placeholder="Please enter your mobile number."
                value={phone}
              />
              {/* 인증 줄은 늘 자리를 지킨다. 발송 후에만 나타나게 하면 그 순간 아래가 전부 밀린다. */}
              <View className="flex-row" style={{ gap: Spacing.tight }}>
                <View className="flex-1">
                  <AuthField
                    editable={!phoneVerified}
                    keyboardType="number-pad"
                    onChangeText={(value) => {
                      setCode(value);
                      verifyCode.reset();
                    }}
                    placeholder="Verification Code"
                    value={code}
                  />
                </View>
                {phoneVerified ? (
                  <Verified />
                ) : codeSent ? (
                  // 코드를 받은 뒤 옆 버튼이 맡는 일은 검증 하나다. 다시 받는 길은
                  // 아래 안내 줄에 둔다 — 버튼 하나가 둘을 번갈아 맡으면
                  // 문자가 오지 않았을 때 다시 보낼 방법이 사라진다.
                  <Button
                    disabled={code.trim().length === 0 || verifyCode.isPending}
                    label="Verify"
                    onPress={() =>
                      verifyCode.mutate({
                        phone: normalizedPhone,
                        code: code.trim(),
                      })
                    }
                    style={{ width: SIDE_BUTTON_WIDTH }}
                    variant="secondary"
                  />
                ) : (
                  <Button
                    disabled={!hasEnoughDigits(phone) || sendCode.isPending}
                    label="Send Code"
                    onPress={send}
                    style={{ width: SIDE_BUTTON_WIDTH }}
                    variant="secondary"
                  />
                )}
              </View>
              <PhoneNote
                busy={sendCode.isPending}
                codeRejected={verifyCode.isError}
                codeSent={codeSent}
                onResend={send}
                phone={normalizedPhone}
                resendIn={resendIn}
                sendFailed={sendCode.isError}
                verified={phoneVerified}
              />
            </View>
          </Field>
        </FormSection>

        <FormSection title="Promotions & Benefits">
          <Field label="Email Address">
            {/* 이메일은 계정 그 자체라 앱에서 바꿀 수 없다. 읽기 전용으로 둔다. */}
            {/* onChangeText 는 쓰이지 않는다 — editable 이 false 라 글자가 들어오지 않는다. */}
            <AuthField
              editable={false}
              onChangeText={noop}
              placeholder="Email Address"
              value={info.email}
            />
          </Field>
          <Field label="Notification Settings (Email & Phone)">
            <View>
              {NOTIFICATION_OPTIONS.map((option) => (
                <ToggleRow
                  checked={agreements[option.key]}
                  description={option.description}
                  key={option.key}
                  onToggle={() => {
                    setAgreements((prev) => ({
                      ...prev,
                      [option.key]: !prev[option.key],
                    }));
                    // 값을 고치면 지난 실패를 치운다 — 이미 고친 것을 아직 틀린 것처럼 말하지 않는다.
                    if (updateInfo.isError) updateInfo.reset();
                  }}
                  title={option.title}
                />
              ))}
            </View>
          </Field>
        </FormSection>
      </FormSections>

      <SubmitBar
        blocker={isDirty ? null : "Change a setting to save."}
        busy={updateInfo.isPending}
        busyLabel="Saving…"
        failure={
          updateInfo.isError
            ? "We couldn't save your settings. Please try again."
            : null
        }
        label="Save Changes"
        onPress={() => updateInfo.mutate(agreements)}
        success={
          updateInfo.isSuccess && !isDirty
            ? "Your changes have been saved."
            : null
        }
      />
    </>
  );
}

/**
 * 인증 줄 아래 한 줄. 여러 상태가 한 자리를 나눠 쓰므로 줄이 늘었다 줄지 않는다.
 * 코드를 받은 뒤의 재발송도 여기 있다 — 옆 버튼은 검증을 맡고 있어 자리가 없다.
 */
function PhoneNote({
  sendFailed,
  codeSent,
  codeRejected,
  verified,
  phone,
  resendIn,
  busy,
  onResend,
}: {
  sendFailed: boolean;
  codeSent: boolean;
  codeRejected: boolean;
  verified: boolean;
  phone: string;
  resendIn: number;
  busy: boolean;
  onResend(): void;
}) {
  if (verified) return null;

  if (sendFailed) {
    return (
      <Note error>
        That number is already in use, or the code couldn&apos;t be sent.
      </Note>
    );
  }

  if (codeRejected) {
    return (
      <Note error>
        The verification code does not match or has expired. Send a new one and
        try again.
      </Note>
    );
  }

  if (codeSent) {
    return (
      <View style={{ gap: Spacing.tight }}>
        <Note>The verification code has been sent to {phone}.</Note>
        <Resend busy={busy} onPress={onResend} secondsLeft={resendIn} />
      </View>
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
