import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface HomeBanner {
  imageUrl: string;
  mobileImageUrl: string;
}

export interface HomePromotion {
  promotionId: number;
  title: string;
  description: string;
  imageUrl: string;
}

export interface GetHomeRes {
  banner: HomeBanner[];
  promotion: HomePromotion[];
}

/**
 * @description 홈 배너 + 프로모션
 */
export const getHome = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("home/v1", {
      searchParams: { languageCode },
    })
    .json<CommonRes<GetHomeRes>>();
