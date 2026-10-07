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

/**
 * 세로 리듬. 블록 사이의 간격은 이 네 값만 쓴다.
 * 전에는 32·40·48·56·64·72·104 가 섞여 있었고, 어느 간격이 무엇을 뜻하는지
 * 화면에서 읽히지 않았다 — 홈에서 상세로 넘어가면 같은 종류의 경계가 매번 달라졌다.
 * 이전 Spacing(half~six)은 네 곳의 paddingBottom 에만 쓰이던 장식이라 지웠다.
 */
export const Spacing = {
  /** 한 묶음 안 — 이미지와 그 밑 제목, 짝이 되는 버튼 사이. */
  tight: 12,
  /** 한 블록 안의 덩어리 사이 — 그리드 행, 폼 묶음과 그 동작. */
  inner: 24,
  /** 섹션과 섹션 사이. Section 의 pt-10 과 같은 값이다. */
  section: 40,
  /** 장과 장 사이 — 상세 화면의 큰 구간. */
  chapter: 64,
} as const;

/**
 * 흰 배경에 막대 하나만 있는 화면 머리의 높이. 앱 헤더·약관·로그인·가입이 모두 같다.
 * 이 꼴의 머리는 언제나 아래 테두리(border-neutral-subtle border-b)를 가진다 —
 * 하나만 테두리가 없으면 그 화면만 떠 있는 것처럼 보인다.
 */
export const HeaderHeight = 52;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
