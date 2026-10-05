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

/** 쓰는 필드만 적는다. 응답에는 section 등이 더 있지만 지금 화면이 그리지 않는다. */
export interface BrandDetail {
  id: number;
  name: string;
  /** 평문이다 — 태그 없이 \n 만 들어 있어 Text 에 그대로 넣는다. */
  description: string;
  bannerList: string[];
  mobileBannerList: string[];
}

/**
 * @description 브랜드 상세. brand/list/filter 에 있는 id 라도 404 가 올 수 있으므로
 * (dev 의 brand/1) 호출부는 실패를 정상 분기로 다뤄야 한다.
 */
export const getBrandDetail = ({
  id,
  languageCode,
}: PublicLanguageCode & { id: number }) =>
  api
    .get(`brand/${id}`, { searchParams: { languageCode } })
    .json<CommonRes<BrandDetail>>();
