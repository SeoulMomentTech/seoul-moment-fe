import { useAppQuery, type UseAppQueryOptions } from "@shared/hooks/useAppQuery";
import { getHomeBannerList } from "@shared/services/banner";


import { homeBannerQueryKeys } from "./queryKeys";

type HomeBannerListQueryResponse = Awaited<ReturnType<typeof getHomeBannerList>>;

type HomeBannerListQueryOptions = Omit<
  UseAppQueryOptions<
    HomeBannerListQueryResponse,
    unknown,
    HomeBannerListQueryResponse,
    ReturnType<typeof homeBannerQueryKeys.list>
  >,
  "queryKey" | "queryFn"
>;

export const useHomeBannerListQuery = (options?: HomeBannerListQueryOptions) =>
  useAppQuery({
    queryKey: homeBannerQueryKeys.list(),
    queryFn: getHomeBannerList,
    ...options,
  });
