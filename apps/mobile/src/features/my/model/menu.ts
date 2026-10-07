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
 *
 * 규칙: 묶음 제목은 묶음이 둘 이상일 때만 그린다(MyScreen 의 hasGroups).
 * 제목은 "이것과 저것을 가른다"는 뜻이라 가를 상대가 없으면 제목이 그것이 묶는
 * 두 줄보다 무거워진다. 계정 줄이 들어와 묶음이 둘이 되면 제목이 저절로 돌아오므로,
 * 지금 제목을 지우려고 구조를 평평하게 펴지 않는다.
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
