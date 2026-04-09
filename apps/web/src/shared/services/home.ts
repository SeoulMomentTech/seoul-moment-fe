import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

export interface HomePromotionListItem {
  id: number;
  thumbnailImageUrl: string;
  title: string;
  description: string;
}

export interface HomePromotion {
  promotionId: number;
  imageUrl: string;
  title: string;
  description: string;
}

export interface GetHomeRes {
  banner: Array<Record<"imageUrl" | "mobileImageUrl", string>>;
  promotionList: Array<HomePromotionListItem>;
  promotion: Array<HomePromotion>;
}

export const getHome = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("home/v1", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetHomeRes>>();
