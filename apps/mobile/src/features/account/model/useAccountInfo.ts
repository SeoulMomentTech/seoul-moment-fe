import type { HTTPError } from "ky";

import { userInfoKey } from "@entities/user/model/keys";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import type { VerifyPhoneCodePayload } from "@shared/services/auth";
import { postInfoPhoneCode, postInfoPhoneVerify } from "@shared/services/auth";
import type { UpdateUserInfoReq } from "@shared/services/user";
import { updateUserInfo } from "@shared/services/user";

import { useQueryClient } from "@tanstack/react-query";

/**
 * 쓰기가 끝난 뒤 계정 정보를 다시 받는다.
 *
 * 캐시에 직접 써 넣지 않고 무효화하는 이유: PATCH 와 인증 응답은 모두 본문이 없어서
 * (data: null) 서버가 실제로 저장한 값을 돌려주지 않는다. 특히 전화번호는 서버가
 * 제 꼴로 정규화해 저장하므로, 우리가 보낸 문자열을 캐시에 써 넣으면 화면이
 * "저장된 값"이 아니라 "우리가 보낸 값"을 보여 주게 된다. 한 화면짜리 폼이고
 * 요청도 한 건이라 다시 받는 값이 싸다.
 *
 * 같은 키를 마이 탭의 신원 블록도 읽으므로, 저장하고 돌아가면 그쪽도 함께 맞춰진다.
 */
const useRefetchUserInfo = () => {
  const queryClient = useQueryClient();
  const id = useUserAuthStore((s) => s.id);

  return () => queryClient.invalidateQueries({ queryKey: userInfoKey(id) });
};

/** 수신 동의 저장. 이메일은 바꿀 수 없고 전화번호는 인증이 따로 세운다. */
export const useUpdateUserInfo = () => {
  const refetch = useRefetchUserInfo();

  return useAppMutation<unknown, HTTPError, UpdateUserInfoReq>({
    mutationFn: updateUserInfo,
    onSuccess: () => void refetch(),
  });
};

/** 번호 바꾸기용 인증 코드 발송. 409 는 이미 다른 계정이 쓰는 번호라는 뜻이다. */
export const useSendPhoneCode = () =>
  useAppMutation<unknown, HTTPError, string>({ mutationFn: postInfoPhoneCode });

/**
 * 받은 코드 검증. 통과하면 그 번호가 계정에 붙으므로, 끝나고 계정 정보를 다시 받는다.
 * 401 은 코드가 만료됐거나 틀렸다는 뜻이다.
 */
export const useVerifyPhoneCode = () => {
  const refetch = useRefetchUserInfo();

  return useAppMutation<unknown, HTTPError, VerifyPhoneCodePayload>({
    mutationFn: postInfoPhoneVerify,
    onSuccess: () => void refetch(),
  });
};
