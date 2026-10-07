import { Platform } from "react-native";

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

/**
 * 글자 크기의 역할. 토큰은 9단계지만 전부 쓰는 것이 목적이 아니라,
 * 한눈에 무엇이 더 중요한지 순위가 보이는 것이 목적이다.
 *
 * - title-3 (24) 화면 제목 · 편집 디스플레이 (상세 배너 제목, Create your account, Hot Keyword 이름)
 * - title-4 (20) 섹션 제목 · 상품 상세의 이름과 가격
 * - body-1  (18) 한 섹션을 대표하는 큰 카드 한 장의 제목 (Featured, 홈 슬라이드)
 * - body-2  (16) 카드 제목 · 줄 라벨 · 버튼 글자 · 그리드 상품 카드의 가격
 * - body-3  (14) 본문 · 설명 · 폼 안내
 * - body-5  (12) 메타 — 바이라인, 날짜, 브랜드 이름, 개수
 *
 * body-4(13) · title-2(32) · title-1(36) 은 일부러 쓰지 않는다. 13 과 14 는 폰에서
 * 구분되지 않아 단계가 되지 못하고, 32/36 은 이 앱에 그만한 글자를 둘 자리가 없다.
 */

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
