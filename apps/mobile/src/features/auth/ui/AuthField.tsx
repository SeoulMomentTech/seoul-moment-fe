import { useState } from "react";

import { Platform, TextInput, View } from "react-native";

import { EyeIcon, EyeOffIcon } from "@shared/ui/icons";
import { Touchable } from "@shared/ui/press";

export const AUTH_FIELD_HEIGHT = 56;
// 입력칸 안쪽 좌우 여백. 56 높이에 16 은 글자가 테두리에 붙어 보여 화면 좌우 여백(20)과 맞춘다.
const PADDING_X = 20;

// TextInput 의 placeholderTextColor 와 동적 테두리 색은 className 을 받지 못해 토큰 값을 직접 쓴다.
const PLACEHOLDER_COLOR = "#707070"; // --neutral-600 (= text-neutral)
const BORDER_IDLE = "#dddddd"; // --neutral-200 (= border-neutral-subtle)
const BORDER_FOCUS = "#f37b2a"; // --brand-500
const BORDER_INVALID = "#ff383c"; // --danger-500

/** 일회용 코드가 오는 길. 자동완성 힌트가 길마다 다르다. */
type OtpChannel = "sms" | "email";

/**
 * 기기가 코드를 대신 채워 넣게 하는 힌트. 없으면 iOS 키보드 위에 코드 제안이 뜨지 않고
 * 안드로이드 자동입력도 걸리지 않아, 받은 코드를 사람이 외워서 옮겨 적어야 한다.
 *
 * textContentType 은 iOS 쪽 이름이고, 안드로이드는 autoComplete 의 sms-otp / email-otp
 * 두 값만 알아듣는다(one-time-code 는 iOS 에서 읽힌다).
 */
const otpProps = (channel: OtpChannel) =>
  ({
    textContentType: "oneTimeCode",
    autoComplete:
      Platform.OS === "android"
        ? channel === "sms"
          ? "sms-otp"
          : "email-otp"
        : "one-time-code",
    importantForAutofill: "yes",
  }) as const;

interface AuthFieldProps {
  value: string;
  placeholder: string;
  onChangeText(text: string): void;
  onSubmitEditing?(): void;
  returnKeyType?: "next" | "go";
  /** true 면 글자를 가리고 오른쪽에 보기/숨기기 토글을 둔다. */
  secureTextEntry?: boolean;
  editable?: boolean;
  keyboardType?: "email-address" | "number-pad";
  /** 칸이 받는 글자 수의 상한. 연도 4자리처럼 길이가 뜻을 가지는 칸에만 준다. */
  maxLength?: number;
  autoComplete?: "email" | "current-password" | "new-password";
  /**
   * 이 칸이 일회용 코드를 받는다는 표시. 값에 따라 기기 자동완성 힌트가 달라진다.
   * 주면 autoComplete 는 이쪽이 정한다.
   */
  otp?: OtpChannel;
  /**
   * maxLength 를 채우는 순간 한 번 부른다. 코드를 다 치면 버튼을 누르지 않아도
   * 넘어가게 하는 자리다 — 자동완성이 여섯 자를 한 번에 넣는 경우도 여기로 온다.
   * 한 자를 지웠다 다시 치면 다시 불리므로, 틀린 코드를 고쳐 쓰는 길이 막히지 않는다.
   */
  onComplete?(value: string): void;
  /** 서버가 거절한 칸. 테두리로도 말한다 — 아래 한 줄만으로는 어느 칸인지 알 수 없다. */
  invalid?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
}

/**
 * 로그인·가입이 함께 쓰는 입력칸.
 * 포커스 테두리가 없으면 어느 칸에 타이핑 중인지 알 수 없어 색을 바꿔 준다.
 */
export function AuthField({
  inputRef,
  editable = true,
  secureTextEntry = false,
  invalid = false,
  otp,
  onComplete,
  ...input
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  // 가린 글자는 오타를 확인할 길이 없다. 웹 가입 폼과 같이 눈 토글을 둔다.
  const [revealed, setRevealed] = useState(false);

  return (
    <View
      className="bg-surface-muted flex-row items-center rounded-lg"
      style={{
        height: AUTH_FIELD_HEIGHT,
        paddingLeft: PADDING_X,
        paddingRight: secureTextEntry ? PADDING_X / 2 : PADDING_X,
        borderWidth: 1,
        // 거절당한 칸은 포커스보다 먼저 말한다 — 고치는 중에도 왜 멈췄는지 보여야 한다.
        borderColor: invalid
          ? BORDER_INVALID
          : focused
            ? BORDER_FOCUS
            : BORDER_IDLE,
        // 잠긴 칸(인증 끝난 이메일)은 편집 가능한 칸과 구분되게 흐리게 둔다.
        opacity: editable ? 1 : 0.6,
      }}
    >
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        className="text-body-2 text-foreground flex-1"
        editable={editable}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        placeholderTextColor={PLACEHOLDER_COLOR}
        ref={inputRef}
        secureTextEntry={secureTextEntry && !revealed}
        submitBehavior="submit"
        {...input}
        {...(otp ? otpProps(otp) : null)}
        onChangeText={(text) => {
          input.onChangeText(text);
          if (
            onComplete &&
            input.maxLength &&
            text.length === input.maxLength
          ) {
            onComplete(text);
          }
        }}
      />
      {secureTextEntry ? (
        <Touchable
          accessibilityLabel={revealed ? "Hide password" : "Show password"}
          accessibilityRole="button"
          className="items-center justify-center"
          hitSlop={8}
          onPress={() => setRevealed((on) => !on)}
          // 아이콘이 20pt 라 터치 영역을 칸 높이만큼 세워 44pt 를 넘긴다.
          style={{ width: 40, height: AUTH_FIELD_HEIGHT }}
        >
          {revealed ? (
            <EyeOffIcon color={PLACEHOLDER_COLOR} />
          ) : (
            <EyeIcon color={PLACEHOLDER_COLOR} />
          )}
        </Touchable>
      ) : null}
    </View>
  );
}
