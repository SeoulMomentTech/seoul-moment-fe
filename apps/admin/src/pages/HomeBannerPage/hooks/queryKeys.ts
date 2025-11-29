import { type HomeBannerId } from "@shared/services/banner";

export const HOME_BANNER_QUERY_KEY = ["admin", "home-banner"] as const;

export const homeBannerQueryKeys = {
  all: HOME_BANNER_QUERY_KEY,
  list: () => [...HOME_BANNER_QUERY_KEY, "list"] as const,
  detail: (bannerId: HomeBannerId | number) =>
    [...HOME_BANNER_QUERY_KEY, "detail", bannerId] as const,
};
