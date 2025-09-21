import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface Category {
  id: number;
  name: string;
}

interface GetCategoriesRes {
  total: number;
  list: Array<Category>;
}

export const getCategories = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("category", {
      searchParams: { languageCode },
    })
    .json<CommonRes<GetCategoriesRes>>(); // 바로 json 파싱
