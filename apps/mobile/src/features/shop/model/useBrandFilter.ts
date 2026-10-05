import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetBrandFilterRes } from "@shared/services/brand";
import { getBrandFilter } from "@shared/services/brand";

import type { CommonRes } from "@shared/services";

export const useBrandFilter = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["shop", "brands", languageCode] as const,
    queryFn: () => getBrandFilter({ languageCode }),
    select: (res: CommonRes<GetBrandFilterRes>): GetBrandFilterRes => res.data,
  });
};
