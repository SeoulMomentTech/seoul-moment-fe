import { getHomeBannerList } from "@shared/services/banner";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { homeBannerQueryKeys } from "./queryKeys";

type HomeBannerListQueryResponse = Awaited<ReturnType<typeof getHomeBannerList>>;

type HomeBannerListQueryOptions = Omit<
  UseQueryOptions<
    HomeBannerListQueryResponse,
    unknown,
    HomeBannerListQueryResponse,
    ReturnType<typeof homeBannerQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useHomeBannerListQuery = (options?: HomeBannerListQueryOptions) =>
  useQuery({
    queryKey: homeBannerQueryKeys.list(),
    queryFn: getHomeBannerList,
    ...options,
  });
