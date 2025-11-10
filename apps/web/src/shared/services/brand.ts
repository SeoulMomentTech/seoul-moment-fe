import type { CommonRes, PublicLanguageCode } from ".";
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

export interface GetBrandDetailReq extends PublicLanguageCode {
  id: number;
}

interface BrandDetailSection {
  title: string;
  content: string;
  imageList: string[];
}

export interface BrandDetailInfo {
  id: number;
  bannerList: string[];
  name: string;
  description: string;
  section: BrandDetailSection[];
}

export const getBrandDetail = ({ id, languageCode }: GetBrandDetailReq) =>
  api
    .get(`brand/${id}`, {
      searchParams: {
        languageCode,
      },
      next: {
        revalidate: 86400,
        tags: [`brandDetail:${id}`, languageCode],
      },
    })
    .json<CommonRes<BrandDetailInfo>>();
