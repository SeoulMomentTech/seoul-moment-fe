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
    items: [
      { labelKey: "favorites", href: "/mypage/interest" },
      { labelKey: "order_history", href: "/mypage/order" },
    ],
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

/** 하위 경로(주문 상세 `/mypage/order/:id`)에서도 해당 메뉴를 활성으로 본다 */
export const isSidebarItemActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
