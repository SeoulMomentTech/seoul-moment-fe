import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { BrandDetail } from "@shared/services/brand";
import { getBrandDetail } from "@shared/services/brand";

import type { CommonRes } from "@shared/services";

/** 잘못된 id 면 요청하지 않는다. */
export const useBrandDetail = (id?: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["brand", "detail", id, languageCode] as const,
    queryFn: () => getBrandDetail({ id: id as number, languageCode }),
    select: (res: CommonRes<BrandDetail>): BrandDetail => res.data,
    enabled: typeof id === "number" && Number.isFinite(id),
  });
};
