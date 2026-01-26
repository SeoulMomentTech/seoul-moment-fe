import { type ApiResponse, type SortDirection } from "./types";

import { fetcher } from ".";

export type AdminProductOptionSort = SortDirection;
export type ProductOptionId = Branded<number, "ProductOptionId">;
export type ProductOptionValueId = Branded<number, "ProductOptionValueId">;

export type ProductOptionType = string;

export type ProductOptionUiType = "GRID" | "RADIO";

export interface AdminProductOptionName {
  languageCode: string;
  name: string;
}

export interface AdminProductOptionValueName {
  languageCode: string;
  value: string;
}

export interface AdminProductOptionListItem {
  id: ProductOptionId;
  type: ProductOptionType;
  nameDto: AdminProductOptionName[];
  createDate: string;
  updateDate: string;
  isActive: boolean;
  uiType: ProductOptionUiType;
}

interface AdminProductOptionListData {
  total: number;
  list: AdminProductOptionListItem[];
}

export interface AdminProductOptionListParams {
  page?: number;
  count?: number;
  search?: string;
  sort?: AdminProductOptionSort;
}

export interface CreateAdminProductOptionTextPayload {
  languageId: number;
  name: string;
}

export interface CreateAdminProductOptionRequest {
  text: CreateAdminProductOptionTextPayload[];
  type: ProductOptionType;
  uiType: ProductOptionUiType;
}

export interface CreateAdminProductOptionValueTextPayload {
  languageId: number;
  value: string;
}

export interface CreateAdminProductOptionValueRequest {
  optionId: number;
  text: CreateAdminProductOptionValueTextPayload[];
  colorCode?: string;
}

export interface UpdateAdminProductOptionValueRequest {
  optionId?: number;
  text?: CreateAdminProductOptionValueTextPayload[];
  colorCode: string | null;
}

export interface UpdateAdminProductOptionRequest {
  text?: CreateAdminProductOptionTextPayload[];
  type?: ProductOptionType;
  uiType?: ProductOptionUiType;
  isActive?: boolean;
}

export interface AdminProductOptionValue {
  id: ProductOptionValueId;
  nameDto: AdminProductOptionValueName[];
  createDate: string;
  updateDate: string;
  colorCode: string | null;
}

export interface AdminProductOptionDetail {
  id: ProductOptionId;
  type: ProductOptionType;
  nameDto: AdminProductOptionName[];
  isActive: boolean;
  uiType: ProductOptionUiType;
  /**
   * @description 옵션 값 객체 리스트
   * ID만 있는 것이 아니라 상세 정보를 포함한 객체 리스트임.
   */
  optionValueList: AdminProductOptionValue[];
  createDate: string;
  updateDate: string;
}

/**
 * @description 상품 옵션 목록 조회
 */
export const getAdminProductOptionList = (
  params?: AdminProductOptionListParams,
) =>
  fetcher.get<ApiResponse<AdminProductOptionListData>>(
    "/admin/product/option",
    {
      params,
    },
  );

/**
 * @description 상품 옵션 등록
 */
export const createAdminProductOption = (
  payload: CreateAdminProductOptionRequest,
) => fetcher.post("/admin/product/option", payload);

/**
 * @description 상품 옵션 값 등록
 */
export const createAdminProductOptionValue = (
  payload: CreateAdminProductOptionValueRequest,
) => fetcher.post("/admin/product/option/value", payload);

/**
 * @description 상품 옵션 값 수정
 */
export const updateAdminProductOptionValue = (
  optionValueId: ProductOptionValueId,
  payload: UpdateAdminProductOptionValueRequest,
) => fetcher.patch(`/admin/product/option/value/${optionValueId}`, payload);

/**
 * @description 상품 옵션 값 삭제
 */
export const deleteAdminProductOptionValue = (
  optionValueId: ProductOptionValueId,
) => fetcher.delete(`/admin/product/option/value/${optionValueId}`);

/**
 * @description 상품 옵션 삭제
 */
export const deleteAdminProductOption = (optionId: ProductOptionId) =>
  fetcher.delete(`/admin/product/option/${optionId}`);

/**
 * @description 상품 옵션 수정
 */
export const updateAdminProductOption = (
  optionId: ProductOptionId,
  payload: UpdateAdminProductOptionRequest,
) => fetcher.patch(`/admin/product/option/${optionId}`, payload);

/**
 * @description 상품 옵션 상세 조회
 */
export const getAdminProductOptionDetail = (optionId: ProductOptionId) =>
  fetcher.get<ApiResponse<AdminProductOptionDetail>>(
    `/admin/product/option/${optionId}`,
  );
