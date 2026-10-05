import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import type { GetProductBannerRes } from "@shared/services/product";
import { getProductBanner } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

export const useProductBanner = () =>
  useAppQuery({
    queryKey: ["shop", "banner"] as const,
    queryFn: getProductBanner,
    select: (res: CommonRes<GetProductBannerRes>): GetProductBannerRes =>
      res.data,
  });
