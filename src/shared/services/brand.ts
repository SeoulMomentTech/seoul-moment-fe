import type { CommonRes } from ".";
import { api } from ".";

type Filter = "A_TO_D" | "E_TO_H" | "I_TO_L" | "M_TO_P" | "Q_TO_T" | "U_TO_Z";

export interface BrandFilter {
  filter: Filter;
  brandNameList: Array<{ id: number; name: string }>;
}

interface GetBrandFilterRes {
  total: number;
  list: BrandFilter[];
}

export const getBrandFilter = (categoryId?: number) =>
  api
    .get("brand/list/filter", {
      searchParams: {
        categoryId,
      },
    })
    .json<CommonRes<GetBrandFilterRes>>();
