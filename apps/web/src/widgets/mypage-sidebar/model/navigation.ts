export interface SidebarItem {
  label: string;
  href: string;
}

export interface SidebarGroup {
  title: string;
  items: ReadonlyArray<SidebarItem>;
}

export const SIDEBAR_GROUPS: ReadonlyArray<SidebarGroup> = [
  {
    title: "쇼핑 정보",
    items: [{ label: "관심", href: "/mypage/interest" }],
  },
  {
    title: "내 정보",
    items: [
      { label: "로그인 정보", href: "/mypage/login-info" },
      { label: "프로필 관리", href: "/mypage/profile" },
      { label: "나의 맞춤 정보", href: "/mypage/custom-info" },
    ],
  },
];
