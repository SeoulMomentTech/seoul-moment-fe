import type { ReactNode } from "react";

import { Text, View } from "react-native";

import { Touchable } from "@shared/ui/press";

import { Spacing } from "@/constants/theme";

/**
 * 입력칸 아래 한 줄. 실패는 danger 로 말한다 — 브랜드 주황은 고르는 것·가는 곳을
 * 뜻하는 색이라, 같은 색으로 실패까지 말하면 두 뜻이 섞인다.
 */
export function FieldNote({
  children,
  error,
}: {
  children: ReactNode;
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

/** 코드를 보냈다는 말. 보낸 곳은 바로 위 칸에 그대로 적혀 있어 여기서 되풀이하지 않는다. */
export const CODE_SENT_MESSAGE = "Verification code sent.";

interface ResendRowProps {
  /** 왼쪽에 적히는 상태. 생략하면 다시 보내기만 오른쪽에 남는다(실패 줄 아래가 그렇다). */
  message?: string;
  secondsLeft: number;
  busy: boolean;
  onResend(): void;
}

/**
 * 코드 발송 상태와 다시 보내기를 한 줄에 담는다.
 *
 * 전에는 "보냈습니다"와 "54초 뒤에 다시 보낼 수 있습니다"가 같은 크기·같은 색으로
 * 두 줄에 쌓여 있었다. 둘은 한 가지 일의 앞뒤라 한 줄이어야 하고, 둘 중 하나만
 * 누를 수 있는 것이므로 그쪽이 오른쪽 끝에서 동작의 자리를 가진다.
 *
 * 기다리는 동안에도 같은 자리에 남은 초를 적는다 — 링크가 사라졌다 나타나면
 * 그 순간 줄 높이가 흔들리고, 왜 없어졌는지도 알 수 없다.
 *
 * 바깥 여백은 들고 있지 않다. 어떤 화면은 gap 을 가진 상자 안에 놓고 어떤 화면은
 * 맨몸으로 놓는데, 자기가 margin 을 쥐면 앞쪽에서만 간격이 두 배가 된다.
 */
export function ResendRow({
  message,
  secondsLeft,
  busy,
  onResend,
}: ResendRowProps) {
  const waiting = secondsLeft > 0 || busy;

  return (
    <View className="flex-row items-center" style={{ gap: Spacing.tight }}>
      {/* 한 줄을 넘기지 않는다. 넘기는 순간 이 줄이 다시 문단이 된다. */}
      <Text className="text-body-3 text-neutral flex-1" numberOfLines={1}>
        {message ?? ""}
      </Text>
      {waiting ? (
        <Text className="text-body-3 text-neutral">
          {busy ? "Sending…" : `Resend in ${secondsLeft}s`}
        </Text>
      ) : (
        <Touchable
          accessibilityLabel="Send the code again"
          accessibilityRole="button"
          hitSlop={14}
          onPress={onResend}
        >
          <Text
            className="text-body-3 text-foreground"
            style={{ textDecorationLine: "underline" }}
          >
            Resend
          </Text>
        </Touchable>
      )}
    </View>
  );
}
