import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetArticleDetailRes } from "@shared/services/article";
import { getArticleDetail } from "@shared/services/article";

import type { CommonRes } from "@shared/services";

const useArticleDetail = (id: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["article", "detail", id, languageCode] as const,
    queryFn: () => getArticleDetail({ id, languageCode }),
    select: (res: CommonRes<GetArticleDetailRes>): GetArticleDetailRes =>
      res.data,
    enabled: Number.isFinite(id),
  });
};

export default useArticleDetail;
