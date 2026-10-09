import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetUserRecentListRes } from "@shared/services/userRecent";
import { getUserRecentList } from "@shared/services/userRecent";

import type { CommonRes } from "@shared/services";

import { LIKES_PAGE, LIKES_PAGE_SIZE, USER_RECENT_KEY } from "./keys";

/**
 * 최근 본 상품. 관심 목록과 한 탭 묶음에 있지만 좋아요가 아니다 —
 * 지울 수단이 없고(API 에 삭제가 없다) 하트도 그리지 않는다.
 */
export const useRecentProducts = () => {
  const languageCode = useLanguage();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const id = useUserAuthStore((s) => s.id);

  return useAppQuery({
    queryKey: [
      ...USER_RECENT_KEY,
      id,
      LIKES_PAGE,
      LIKES_PAGE_SIZE,
      languageCode,
    ] as const,
    queryFn: () =>
      getUserRecentList({
        page: LIKES_PAGE,
        count: LIKES_PAGE_SIZE,
        languageCode,
      }),
    select: (res: CommonRes<GetUserRecentListRes>): GetUserRecentListRes =>
      res.data,
    enabled: isAuthenticated,
  });
};
