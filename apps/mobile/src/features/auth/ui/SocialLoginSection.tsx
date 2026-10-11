import { Text, View } from "react-native";

import { Spacing } from "@/constants/theme";

import { LineLoginButton } from "./LineLoginButton";
import { isLineLoginConfigured } from "../lib/lineIdentity";

/**
 * SNS 로그인 묶음. 이메일로 하던 일과 **갈래가 다른 길**이라 선 하나로 끊는다 —
 * 선이 없으면 전체 폭 버튼 셋이 그냥 쌓여, 그중 무엇이 주요 동작인지 눈이 못 찾는다.
 *
 * provider 가 늘어도 이 안에만 더하면 된다. 하나도 설정되지 않았으면 선까지 통째로
 * 그리지 않는다 — 아무것도 없는 자리 위에 "or continue with" 만 남으면 더 이상하다.
 */
export function SocialLoginSection() {
  // provider 를 더할 때 이 줄에 or 로 잇는다.
  const hasAnyProvider = isLineLoginConfigured;

  if (!hasAnyProvider) return null;

  return (
    <View style={{ marginTop: Spacing.section }}>
      <Divider label="or continue with" />
      {/* 대만에서는 LINE 이 먼저다. 쓰는 사람이 더 많은 쪽이 위에 선다. */}
      <LineLoginButton />
    </View>
  );
}

/** 가운데 글자를 낀 가로선. 양쪽 선이 남은 폭을 반씩 가진다. */
function Divider({ label }: { label: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: Spacing.tight }}>
      <View className="border-neutral-subtle flex-1 border-t" />
      <Text className="text-body-5 text-neutral">{label}</Text>
      <View className="border-neutral-subtle flex-1 border-t" />
    </View>
  );
}
