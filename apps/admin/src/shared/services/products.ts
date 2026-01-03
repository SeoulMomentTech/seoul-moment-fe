import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminProductItemSort = SortDirection;

export type AdminProductItemId = Branded<number, "AdminProductItemId">;

export type AdminProductId = Branded<number, "AdminProductId">;

export interface AdminProductItem {
  id: AdminProductItemId;
  productId: AdminProductId;
  imageUrl: string;
  colorCode: string;
  price: number;
  discountPrice: number;
  createDate: string;
  updateDate: string;
}

interface AdminProductItemListData {
  total: number;
  list: AdminProductItem[];
}

export interface AdminProductItemListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: AdminProductItemSort;
}

/**
 * @description 상품 정보 리스트
 */
export const getAdminProductItemList = (params?: AdminProductItemListParams) =>
  fetcher.get<ApiResponse<AdminProductItemListData>>("/admin/product/item", {
    params,
  });
