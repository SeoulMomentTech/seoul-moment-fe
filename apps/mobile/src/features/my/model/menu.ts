import type { Href } from "expo-router";

import type { MessageKey } from "@shared/lib/i18n/translate";

export interface MyMenuItem {
  labelKey: MessageKey;
  href: Href;
}

export interface MyMenuGroup {
  titleKey: MessageKey;
  items: MyMenuItem[];
}

/** 로그인해야 뜻이 생기는 줄들. 비로그인에게는 전부 401 화면으로 가는 길일 뿐이다. */
export const MY_INFO_GROUP: MyMenuGroup = {
  titleKey: "my_info",
  items: [
    { labelKey: "login_info", href: "/account/login-info" },
    { labelKey: "profile_settings", href: "/account/profile" },
    { labelKey: "personalized_info", href: "/account/preferences" },
  ],
};

/** 누구나 읽을 수 있는 글. 로그인과 무관하다. */
export const HELP_GROUP: MyMenuGroup = {
  titleKey: "help",
  items: [
    { labelKey: "terms_of_service", href: "/terms" },
    { labelKey: "privacy_policy", href: "/policy" },
  ],
};
