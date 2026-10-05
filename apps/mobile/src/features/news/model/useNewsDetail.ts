import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetNewsDetailRes } from "@shared/services/news";
import { getNewsDetail } from "@shared/services/news";

import type { CommonRes } from "@shared/services";

export const useNewsDetail = (id: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["news", "detail", id, languageCode] as const,
    queryFn: () => getNewsDetail({ id, languageCode }),
    select: (res: CommonRes<GetNewsDetailRes>): GetNewsDetailRes => res.data,
    enabled: Number.isFinite(id),
  });
};
