import type { Href } from "expo-router";

export interface MyMenuItem {
  label: string;
  href: Href;
}

export interface MyMenuGroup {
  title: string;
  items: MyMenuItem[];
}

/** 로그인해야 뜻이 생기는 줄들. 비로그인에게는 전부 401 화면으로 가는 길일 뿐이다. */
const MY_INFO_GROUP: MyMenuGroup = {
  title: "My info",
  items: [
    { label: "Login info", href: "/account/login-info" },
    { label: "Manage profile", href: "/account/profile" },
    { label: "My preferences", href: "/account/preferences" },
  ],
};

/** 누구나 읽을 수 있는 글. 로그인과 무관하다. */
const HELP_GROUP: MyMenuGroup = {
  title: "Help",
  items: [
    { label: "Terms of service", href: "/terms" },
    { label: "Privacy policy", href: "/policy" },
  ],
};

/**
 * 마이 탭의 메뉴. 로그인 여부로 갈린다 — 비로그인에게 계정 줄을 깔면
 * 눌러도 "로그아웃 상태입니다" 밖에 못 보는 줄이 셋 생긴다.
 *
 * 규칙: 묶음 제목은 묶음이 둘 이상일 때만 그린다(MyScreen 의 hasGroups).
 * 제목은 "이것과 저것을 가른다"는 뜻이라 가를 상대가 없으면 제목이 그것이 묶는
 * 두 줄보다 무거워진다. 그래서 비로그인에서는 Help 한 묶음뿐이라 제목이 사라지고,
 * 로그인하면 둘이 되어 두 제목이 함께 돌아온다 — 어느 쪽도 손으로 켜고 끄지 않는다.
 */
export const myMenuGroups = (isAuthenticated: boolean): MyMenuGroup[] =>
  isAuthenticated ? [MY_INFO_GROUP, HELP_GROUP] : [HELP_GROUP];
