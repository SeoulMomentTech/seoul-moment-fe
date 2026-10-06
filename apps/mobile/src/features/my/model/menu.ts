import type { LanguageType } from "@shared/lib/i18n/language";

// 웹 공개 사이트. 앱에 아직 약관·고객센터 화면이 없어 브라우저로 넘긴다.
const WEB_BASE_URL = "https://seoulmoment.com.tw";

export interface MyMenuItem {
  label: string;
  /** 웹 경로. 로케일 접두사는 열 때 붙인다. */
  path: string;
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
      { label: "Customer service", path: "/contact" },
      { label: "Terms of service", path: "/terms" },
      { label: "Privacy policy", path: "/policy" },
    ],
  },
];

/** 기기 언어에 맞는 웹 페이지 주소. 세 로케일 모두 실제로 존재하는 것을 확인했다. */
export const webUrl = (path: string, languageCode: LanguageType) =>
  `${WEB_BASE_URL}/${languageCode}${path}`;
