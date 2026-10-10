import { useRouter } from "expo-router";

import { useShopFilterStore } from "./useShopFilterStore";

/**
 * 브랜드 하나만 건 상품 목록으로 보낸다. 상품 상세의 브랜드 줄과 프로모션 상세의
 * Shop 버튼이 같은 일을 해서, 거는 조건도 가는 방법도 여기 한 곳에서만 정한다.
 *
 * 웹은 /product?brandId= 라는 주소 하나로 같은 일을 하지만, 앱의 Shop 은 탭이라
 * 주소가 아니라 store 가 조건을 들고 있다.
 */
export const useOpenBrandShop = () => {
  const router = useRouter();
  const selectOnlyBrand = useShopFilterStore((s) => s.selectOnlyBrand);

  return (brandId: number) => {
    selectOnlyBrand(brandId);
    // 탭은 이미 스택 아래에 있으므로 push 로 쌓지 않고 그 탭으로 돌아간다.
    router.navigate("/shop");
  };
};
