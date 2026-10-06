import { useState } from "react";

import { TextInput } from "react-native";

export const AUTH_FIELD_HEIGHT = 56;
// 입력칸 안쪽 좌우 여백. 56 높이에 16 은 글자가 테두리에 붙어 보여 화면 좌우 여백(20)과 맞춘다.
const PADDING_X = 20;

// TextInput 의 placeholderTextColor 와 동적 테두리 색은 className 을 받지 못해 토큰 값을 직접 쓴다.
const PLACEHOLDER_COLOR = "#707070"; // --neutral-600 (= text-neutral)
const BORDER_IDLE = "#dddddd"; // --neutral-200 (= border-neutral-subtle)
const BORDER_FOCUS = "#f37b2a"; // --brand-500

interface AuthFieldProps {
  value: string;
  placeholder: string;
  onChangeText(text: string): void;
  onSubmitEditing?(): void;
  returnKeyType?: "next" | "go";
  secureTextEntry?: boolean;
  editable?: boolean;
  keyboardType?: "email-address" | "number-pad";
  autoComplete?: "email" | "current-password" | "new-password";
  inputRef?: React.RefObject<TextInput | null>;
}

/**
 * 로그인·가입이 함께 쓰는 입력칸.
 * 포커스 테두리가 없으면 어느 칸에 타이핑 중인지 알 수 없어 색을 바꿔 준다.
 */
export function AuthField({
  inputRef,
  editable = true,
  ...input
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      className="bg-surface-muted text-body-2 text-foreground rounded-lg"
      editable={editable}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      placeholderTextColor={PLACEHOLDER_COLOR}
      ref={inputRef}
      style={{
        height: AUTH_FIELD_HEIGHT,
        paddingHorizontal: PADDING_X,
        borderWidth: 1,
        borderColor: focused ? BORDER_FOCUS : BORDER_IDLE,
        // 잠긴 칸(인증 끝난 이메일)은 편집 가능한 칸과 구분되게 흐리게 둔다.
        opacity: editable ? 1 : 0.6,
      }}
      submitBehavior="submit"
      {...input}
    />
  );
}
