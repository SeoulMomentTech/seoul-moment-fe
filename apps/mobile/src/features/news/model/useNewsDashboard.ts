import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetNewsDashboardRes } from "@shared/services/news";
import { getNewsDashboard } from "@shared/services/news";

import type { CommonRes } from "@shared/services";

/**
 * 대시보드의 세 구획(Featured/Latest · Editor's Pick · Hot Keyword)이 전부 비었는지.
 * Lifestyle 목록까지 비면 News 탭이 통째로 흰 종이가 되므로, 그 한 경우를 가려
 * LifestyleEmpty 가 대신 한 마디를 한다. 로딩·에러면 그쪽이 할 말이 있으니 false 다.
 */
export const useNewsDashboardIsEmpty = () => {
  const { data, isPending, isError } = useNewsDashboard();

  if (isPending || isError) return false;

  return (
    (data?.recentList?.length ?? 0) === 0 &&
    (data?.editorPickList?.length ?? 0) === 0 &&
    (data?.hashtag?.list?.length ?? 0) === 0
  );
};

export const useNewsDashboard = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["news", "dashboard", languageCode] as const,
    queryFn: () => getNewsDashboard({ languageCode }),
    select: (res: CommonRes<GetNewsDashboardRes>): GetNewsDashboardRes =>
      res.data,
  });
};
