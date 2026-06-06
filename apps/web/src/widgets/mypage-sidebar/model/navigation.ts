export interface SidebarItem {
  labelKey: string;
  href: string;
}

export interface SidebarGroup {
  titleKey: string;
  items: ReadonlyArray<SidebarItem>;
}

export const SIDEBAR_GROUPS: ReadonlyArray<SidebarGroup> = [
  {
    titleKey: "shopping_info",
    items: [{ labelKey: "favorites", href: "/mypage/interest" }],
  },
  {
    titleKey: "my_profile",
    items: [
      { labelKey: "login_info", href: "/mypage/login-info" },
      { labelKey: "profile_settings", href: "/mypage/profile" },
      { labelKey: "personalized_info", href: "/mypage/custom-info" },
    ],
  },
];
