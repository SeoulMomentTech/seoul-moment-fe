import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export type BrandFilterGroup =
  | "A_TO_D"
  | "E_TO_H"
  | "I_TO_L"
  | "M_TO_P"
  | "Q_TO_T"
  | "U_TO_Z";

export interface BrandFilter {
  filter: BrandFilterGroup;
  brandNameList: { id: number; name: string }[];
}

export interface GetBrandFilterRes {
  total: number;
  list: BrandFilter[];
}

export interface GetBrandFilterReq extends Partial<PublicLanguageCode> {
  categoryId?: number;
}

/**
 * @description 알파벳 구간별 브랜드 목록. languageCode 는 헤더로 변환되고, categoryId 는 선택이다.
 */
export const getBrandFilter = ({
  languageCode,
  categoryId,
}: GetBrandFilterReq = {}) =>
  api
    .get("brand/list/filter", {
      searchParams: {
        ...(languageCode == null ? {} : { languageCode }),
        ...(categoryId == null ? {} : { categoryId }),
      },
    })
    .json<CommonRes<GetBrandFilterRes>>();
