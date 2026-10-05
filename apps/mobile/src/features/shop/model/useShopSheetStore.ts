import { create } from "zustand";

interface ShopSheetState {
  filterOpen: boolean;
  sortOpen: boolean;
  setFilterOpen(open: boolean): void;
  setSortOpen(open: boolean): void;
}

/**
 * 필터·정렬 시트의 열림 상태. 필터 값(useShopFilterStore)과 섞지 않고 UI 상태만 둔다.
 * 버튼은 FlatList 헤더 안에, 시트는 FlatList 밖(화면 루트)에 있어서 둘 다 닿을 수 있는
 * 모듈 단위 store 에 둔다.
 */
export const useShopSheetStore = create<ShopSheetState>()((set) => ({
  filterOpen: false,
  sortOpen: false,
  setFilterOpen: (open) => set(() => ({ filterOpen: open })),
  setSortOpen: (open) => set(() => ({ sortOpen: open })),
}));
