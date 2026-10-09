import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import type { GetUserFitRes } from "@shared/services/user";
import { getUserFit } from "@shared/services/user";

import type { CommonRes } from "@shared/services";

import { userFitKey } from "./keys";

/**
 * 체형 정보. 한 번도 저장하지 않은 사람에게는 data 가 null 로 온다 —
 * 그래서 select 가 null 을 지우지 않고 그대로 흘린다. 그 null 이 "아직 없다"는 뜻이고,
 * 저장할 때 POST(생성) 와 PATCH(수정) 중 무엇을 부를지를 가른다.
 */
export const useUserFit = () => {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const id = useUserAuthStore((s) => s.id);

  return useAppQuery({
    queryKey: userFitKey(id),
    queryFn: getUserFit,
    select: (res: CommonRes<GetUserFitRes | null>): GetUserFitRes | null =>
      res.data,
    enabled: isAuthenticated,
  });
};
