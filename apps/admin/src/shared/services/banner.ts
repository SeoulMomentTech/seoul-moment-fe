import { type ApiResponse } from "./types";

import { fetcher } from ".";

export type HomeBannerId = Branded<number, "HomeBannerId">;

export interface HomeBanner {
  id: HomeBannerId;
  imageUrl: string;
  mobileImageUrl: string;
}

interface HomeBannerListData {
  total: number;
  list: HomeBanner[];
}

export interface CreateHomeBannerRequest {
  imageUrl: string;
  mobileImageUrl: string;
}

export interface UpdateHomeBannerRequest {
  bannerId: HomeBannerId;
  imageUrl?: string;
  mobileImageUrl?: string;
}

export const getHomeBannerList = () =>
  fetcher.get<ApiResponse<HomeBannerListData>>("/admin/home/v1/banner");

export const createHomeBanner = (payload: CreateHomeBannerRequest) =>
  fetcher.post("/admin/home/v1/banner", payload);

export const updateHomeBanner = ({
  bannerId,
  ...payload
}: UpdateHomeBannerRequest) =>
  fetcher.patch(`/admin/home/v1/banner/${bannerId}`, payload);

export const deleteHomeBanner = (bannerId: HomeBannerId) =>
  fetcher.delete(`/admin/home/banner/${bannerId}`);
