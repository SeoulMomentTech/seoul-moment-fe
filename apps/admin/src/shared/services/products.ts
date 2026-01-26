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

export interface AdminProductItemVariantOptionValue {
  id: number;
  value: string;
}

export interface AdminProductItemVariant {
  sku: string;
  stockQuantity: number;
  /**
   * @description 옵션 값 객체 리스트 (상세 정보 포함)
   */
  optionValueList: AdminProductItemVariantOptionValue[];
}

/**
 * @description 상품 아이템 변형 옵션 값 입력 (ID만 허용)
 * 이전에는 객체도 허용되었으나, optionValueIdList 명명 규칙에 맞춰 ID(number)만 사용하도록 제한함.
 */
export type AdminProductItemVariantOptionValueInput = number;

export interface AdminProductItemVariantInput {
  sku: string;
  stockQuantity: number;
  /**
   * @description 옵션 값 ID 리스트
   * ID(number) 배열만 전달해야 함.
   */
  optionValueIdList: AdminProductItemVariantOptionValueInput[];
}

export interface AdminProductItemDetail {
  id: AdminProductItemId;
  productId: AdminProductId;
  mainImageUrl: string;
  price: number;
  discountPrice?: number;
  shippingCost: number;
  shippingInfo: number;
  imageUrlList?: string[];
  variantList: AdminProductItemVariant[];
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

export interface CreateAdminProductItemRequest {
  productId: number;
  mainImageUrl: string;
  price: number;
  discountPrice?: number;
  shippingCost: number;
  shippingInfo: number;
  imageUrlList?: string[];
  variantList: AdminProductItemVariantInput[];
}

export interface UpdateAdminProductItemRequest {
  productId?: number;
  mainImageUrl?: string;
  price?: number;
  discountPrice?: number;
  shippingCost?: number;
  shippingInfo?: number;
  imageUrlList?: string[];
  variantList?: AdminProductItemVariantInput[];
}

/**
 * @description 상품 정보 리스트
 */
export const getAdminProductItemList = (params?: AdminProductItemListParams) =>
  fetcher.get<ApiResponse<AdminProductItemListData>>("/admin/product/item", {
    params,
  });

/**
 * @description 상품 아이템 상세 조회
 */
export const getAdminProductItemDetail = (productItemId: AdminProductItemId) =>
  fetcher.get<ApiResponse<AdminProductItemDetail>>(
    `/admin/product/item/${productItemId}`,
  );

/**
 * @description 상품 아이템 생성
 */
export const createAdminProductItem = (
  payload: CreateAdminProductItemRequest,
) => fetcher.post("/admin/product/item", payload);

/**
 * @description 상품 아이템 수정
 */
export const updateAdminProductItem = (
  productItemId: AdminProductItemId,
  payload: UpdateAdminProductItemRequest,
) => fetcher.patch(`/admin/product/item/${productItemId}`, payload);

/**
 * @description 상품 아이템 삭제
 */
export const deleteAdminProductItem = (productItemId: AdminProductItemId) =>
  fetcher.delete(`/admin/product/item/${productItemId}`);
