import type { Category } from "./category";

import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

interface GetPartnersReq extends PublicLanguageCode {
  id: number;
  country: PublicLanguageCode["languageCode"];
}

interface GetPartnerRes {
  total: number;
  list: [];
}

export const getPartners = ({ id, country, languageCode }: GetPartnersReq) =>
  api
    .get("partner", {
      searchParams: {
        partnerCategoryId: id,
        country,
        languageCode,
      },
    })
    .json<CommonRes<GetPartnerRes>>();

interface GetPartnerCategoriesRes {
  total: number;
  list: Array<Category>;
}

export const getPartnerCategories = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("partner/category", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetPartnerCategoriesRes>>();
