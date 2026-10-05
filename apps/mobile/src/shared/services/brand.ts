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

export interface BrandDetailSection {
  title: string;
  content: string;
  imageList: string[];
}

/** 쓰는 필드만 적는다. */
export interface BrandDetail {
  id: number;
  name: string;
  /** 평문이다 — 태그 없이 \n 만 들어 있어 Text 에 그대로 넣는다. */
  description: string;
  bannerList: string[];
  mobileBannerList: string[];
  section: BrandDetailSection[];
}

/**
 * @description 브랜드 소개. 상품 목록 헤더가 쓰는 product/banner/brand 와는 다른 엔드포인트로,
 * 이쪽만 section(소개 본문)을 준다. 두 엔드포인트가 404 를 주는 id 는 서로 같다(dev 의 1번).
 */
export const getBrandDetail = ({
  id,
  languageCode,
}: PublicLanguageCode & { id: number }) =>
  api
    .get(`brand/${id}`, { searchParams: { languageCode } })
    .json<CommonRes<BrandDetail>>();
