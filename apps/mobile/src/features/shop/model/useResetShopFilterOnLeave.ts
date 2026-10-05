import { useEffect } from "react";

import { usePathname } from "expo-router";

import { useShopFilterStore } from "./useShopFilterStore";

// Shop 을 뺀 나머지 탭의 경로. 상품 상세(/product/...)는 탭이 아니라 탭 위에 쌓이는 화면이라
// 여기 없고, 그래서 상세를 보고 돌아와도 필터가 그대로 남는다.
// 탭 경로는 원래 app 레이어의 것이지만, 네이티브·웹 탭 레이아웃 두 곳이 같은 목록을 써야 해서
// 리셋 로직과 함께 한 군데에 둔다.
const TABS_OUTSIDE_SHOP = ["/", "/news", "/my"];

/**
 * 다른 탭으로 넘어가면 Shop 필터를 비운다. 필터는 Shop 화면 안에서만 보이는데 store 는
 * 모듈 단위라, 비우지 않으면 돌아왔을 때 보이지 않는 조건이 목록에 걸려 있다.
 * 탭이 바뀌어도 마운트된 채인 탭 레이아웃에서 부른다.
 */
export const useResetShopFilterOnLeave = () => {
  const pathname = usePathname();
  const reset = useShopFilterStore((s) => s.reset);

  useEffect(() => {
    if (TABS_OUTSIDE_SHOP.includes(pathname)) reset();
  }, [pathname, reset]);
};
