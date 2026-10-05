import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface Category {
  id: number;
  name: string;
}

export interface GetCategoriesRes {
  total: number;
  list: Category[];
}

/**
 * @description 최상위 카테고리(패션·화장품·악세서리). 여기 id 가 `categoryId` 다.
 * 그 아래 상품 카테고리(후드/집업 등)는 product/category 가 주고, 그 id 는
 * `productCategoryId` 라 서로 바꿔 쓰면 목록이 0건이 된다.
 */
export const getCategories = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("category", { searchParams: { languageCode } })
    .json<CommonRes<GetCategoriesRes>>();
