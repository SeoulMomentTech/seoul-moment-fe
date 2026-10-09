import type { ReactNode } from "react";

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
import { ScreenHeader } from "@shared/ui/screen-header";
import {
  ACCOUNT_TOGGLE_DESC_HEIGHT,
  ACCOUNT_TOGGLE_ROW_HEIGHT,
} from "@shared/ui/skeleton";

import { Spacing } from "@/constants/theme";

// 안내 한 줄의 자리. body-3 한 줄 높이(shared/ui/skeleton 의 LINE_BODY_3)와 같다.
// 줄을 늘 비워 두는 이유는 안내가 들고 날 때마다 저장 버튼이 29pt 씩 오르내리지 않게 하려는 것이다.
const NOTE_LINE = 17;
// 동의 줄의 동그라미. 가입 화면 TermsConsent 의 BOX_SIZE 와 같다.
const CHECK_SIZE = 20;

/**
 * 계정 화면 세 개가 같이 쓰는 틀. 사진 없는 화면이라 스크림 없이 흰 배경에
 * 평범한 머리(뒤로가기 + 아래 테두리)를 두고, 남은 높이를 본문에 넘긴다.
 */
export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <ScreenHeader />
      {children}
    </View>
  );
}

/**
 * 폼 본문. 맨 위에 화면 제목(title-3)을 두고 40 을 띄운 뒤 내용을 놓는다 —
 * 스켈레톤도 실제 폼도 그 40 아래에서 시작하므로, 데이터가 도착해도 제목이 움직이지 않는다.
 */
export function AccountBody({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Spacing.inner,
          paddingBottom: insets.bottom + Spacing.section,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-title-3 text-foreground font-bold">{title}</Text>
        <View style={{ marginTop: Spacing.section }}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** 섹션과 섹션 사이는 40 하나뿐이다. 섹션 안의 칸 사이는 24(FormSection 이 쥔다). */
export function FormSections({ children }: { children: ReactNode }) {
  return <View style={{ gap: Spacing.section }}>{children}</View>;
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Text className="text-title-4 text-foreground font-bold">{title}</Text>
      <View style={{ marginTop: Spacing.tight, gap: Spacing.inner }}>
        {children}
      </View>
    </View>
  );
}

/** 라벨 한 줄 + 12 + 칸. 세 화면의 모든 칸이 이 꼴이다. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Text className="text-body-3 text-neutral">{label}</Text>
      <View style={{ marginTop: Spacing.tight }}>{children}</View>
    </View>
  );
}

/**
 * 한 줄 안내. 실패는 danger 로 말한다 — 브랜드 주황은 선택·이동·주요 동작을
 * 뜻하는 색이라, 같은 색으로 실패까지 말하면 뜻이 겹친다. 가입 화면과 같은 규칙이다.
 */
export function Note({
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

/**
 * 폼의 꼬리 — 안내 한 줄과 저장 버튼.
 *
 * 버튼만 흐려 두면 무엇이 모자란지 알 수 없어서 버튼 바로 위에 이유를 적는다.
 * 서버가 거절한 것이 있으면 그것이 먼저고, 없으면 아직 못 채운 것을 말한다.
 * 가입 화면의 blocker 한 줄과 같은 규칙이다 — 모자란 것을 한꺼번에 늘어놓지 않는다.
 */
export function SubmitBar({
  blocker,
  failure,
  success = null,
  label,
  busyLabel,
  busy,
  onPress,
}: {
  /** 지금 저장을 막고 있는 한 가지. 없으면 저장할 수 있다. */
  blocker: string | null;
  /** 방금 실패한 이유와 되돌릴 방법. 있으면 다른 무엇보다 먼저 보인다. */
  failure: string | null;
  /** 방금 저장됐다는 말. 토스트가 없는 앱이라 이 줄이 그 자리를 맡는다. */
  success?: string | null;
  label: string;
  busyLabel: string;
  busy: boolean;
  onPress(): void;
}) {
  return (
    <>
      {/* 줄 자리는 늘 비워 둔다 — 안내가 들고 날 때마다 버튼이 오르내리지 않게. */}
      <View style={{ marginTop: Spacing.inner, minHeight: NOTE_LINE }}>
        {failure ? (
          <Note error>{failure}</Note>
        ) : success ? (
          <Note>{success}</Note>
        ) : blocker ? (
          <Note>{blocker}</Note>
        ) : null}
      </View>
      <Button
        disabled={blocker != null || busy}
        label={busy ? busyLabel : label}
        onPress={onPress}
        style={{ marginTop: Spacing.tight }}
      />
    </>
  );
}

/**
 * 수신 동의 한 줄. 제목 아래 설명이 붙고, 줄 전체가 하나의 체크박스다.
 *
 * 설명 자리는 두 줄로 못 박혀 있다(ACCOUNT_TOGGLE_DESC_HEIGHT). 셋 중 하나만 한 줄에
 * 들어가는데, 줄마다 높이가 달라지면 세 줄이 격자로 읽히지 않는다.
 */
export function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle(): void;
}) {
  return (
    <Touchable
      accessibilityLabel={`${title}. ${description}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-start"
      onPress={onToggle}
      style={{ height: ACCOUNT_TOGGLE_ROW_HEIGHT, paddingVertical: 12 }}
    >
      <View
        className={
          checked
            ? "bg-foreground border-foreground items-center justify-center border"
            : "border-neutral-subtle items-center justify-center border"
        }
        style={{
          width: CHECK_SIZE,
          height: CHECK_SIZE,
          borderRadius: CHECK_SIZE / 2,
          marginRight: Spacing.tight,
        }}
      >
        {/* 체크 글리프. 흰 글씨라 토큰 대신 text-background 를 쓴다. */}
        {checked ? (
          <Text className="text-body-5 text-background font-bold">✓</Text>
        ) : null}
      </View>
      <View className="flex-1">
        <Text className="text-body-3 text-foreground">{title}</Text>
        <View style={{ height: ACCOUNT_TOGGLE_DESC_HEIGHT }}>
          <Text className="text-body-5 text-neutral" numberOfLines={2}>
            {description}
          </Text>
        </View>
      </View>
    </Touchable>
  );
}
