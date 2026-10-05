import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetNewsDashboardRes } from "@shared/services/news";
import { getNewsDashboard } from "@shared/services/news";

import type { CommonRes } from "@shared/services";

export const useNewsDashboard = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["news", "dashboard", languageCode] as const,
    queryFn: () => getNewsDashboard({ languageCode }),
    select: (res: CommonRes<GetNewsDashboardRes>): GetNewsDashboardRes =>
      res.data,
  });
};
