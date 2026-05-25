import { parseAsStringLiteral, useQueryState } from "nuqs";

export const MY_PAGE_TABS = ["product", "brand", "recent"] as const;
export type MyPageTab = (typeof MY_PAGE_TABS)[number];

export function useMyPageTab() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral(MY_PAGE_TABS).withDefault("product"),
  );

  return { tab, setTab };
}
