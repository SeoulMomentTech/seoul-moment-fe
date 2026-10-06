import type { Href } from "expo-router";

export interface MyMenuItem {
  label: string;
  href: Href;
}

export interface MyMenuGroup {
  title: string;
  items: MyMenuItem[];
}

/**
 * 비로그인 상태에서 쓸 수 있는 메뉴만 둔다.
 * 장바구니·관심상품·프로필은 로그인이 있어야 의미가 생겨서 아직 넣지 않았다 —
 * 갈 곳 없는 줄을 깔아 두지 않는다.
 */
export const MY_MENU_GROUPS: MyMenuGroup[] = [
  {
    title: "Help",
    items: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/policy" },
    ],
  },
];
