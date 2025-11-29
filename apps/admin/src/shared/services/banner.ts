import { fetcher } from ".";

interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export type HomeBannerId = Branded<number, "HomeBannerId">;

export interface HomeBanner {
  id: HomeBannerId;
  image: string;
  mobileImage: string;
}

interface HomeBannerListData {
  total: number;
  list: HomeBanner[];
}

export interface CreateHomeBannerRequest {
  image: string;
  mobileImage: string;
}

export interface UpdateHomeBannerRequest {
  bannerId: HomeBannerId;
  image?: string;
  mobileImage?: string;
}

export const getHomeBannerList = () =>
  fetcher.get<ApiResponse<HomeBannerListData>>("/admin/home/banner");

export const createHomeBanner = (payload: CreateHomeBannerRequest) =>
  fetcher.post("/admin/home/banner", payload);

export const updateHomeBanner = ({
  bannerId,
  ...payload
}: UpdateHomeBannerRequest) =>
  fetcher.patch(`/admin/home/banner/${bannerId}`, payload);

export const deleteHomeBanner = (bannerId: HomeBannerId) =>
  fetcher.delete(`/admin/home/banner/${bannerId}`);
