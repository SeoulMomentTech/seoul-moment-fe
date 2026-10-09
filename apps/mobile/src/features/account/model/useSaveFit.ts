import type { HTTPError } from "ky";

import { userFitKey } from "@entities/user/model/keys";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import type { UserFitPayload } from "@shared/services/user";
import { createUserFit, updateUserFit } from "@shared/services/user";

import { useQueryClient } from "@tanstack/react-query";

/**
 * 체형 정보 저장. 한 번도 저장한 적 없으면 POST(생성), 있으면 PATCH(수정)다 —
 * web 과 같은 갈림이고, 그 판정은 조회 응답의 data 가 null 인지로 한다.
 *
 * 저장이 끝나면 다시 받는다(캐시에 직접 쓰지 않는다). 응답에 본문이 없고(data: null),
 * 폼은 문자열을 들고 있는데 서버가 돌려주는 것은 숫자라 우리가 써 넣은 값이
 * 다음에 받은 값과 모양이 다르다. 생성 뒤에는 "이제 있다"는 사실도 다시 받아야
 * 다음 저장이 PATCH 로 간다.
 */
export const useSaveFit = ({ exists }: { exists: boolean }) => {
  const queryClient = useQueryClient();
  const id = useUserAuthStore((s) => s.id);

  return useAppMutation<unknown, HTTPError, UserFitPayload>({
    mutationFn: exists ? updateUserFit : createUserFit,
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: userFitKey(id) }),
  });
};
