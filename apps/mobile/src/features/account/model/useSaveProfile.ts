import { userProfileKey } from "@entities/user/model/keys";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import { postNicknameValidate } from "@shared/services/auth";
import type { UpdateUserProfileReq } from "@shared/services/user";
import {
  updateUserProfile,
  updateUserProfileName,
  updateUserProfileNickname,
} from "@shared/services/user";

import { useQueryClient } from "@tanstack/react-query";

/** 어느 단계에서 멈췄는지. 화면은 이 값으로 무엇이 틀렸고 어떻게 다시 할지를 고른다. */
export type ProfileSaveStep =
  | "nickname-taken"
  | "nickname"
  | "name"
  | "profile";

export class ProfileSaveError extends Error {
  constructor(readonly step: ProfileSaveStep) {
    super(step);
    this.name = "ProfileSaveError";
  }
}

export interface SaveProfileInput {
  /** 바뀐 것만 담는다. 닉네임·이름은 각자 전용 엔드포인트라 따로 보낸다. */
  nickname?: string;
  name?: string;
  profile: UpdateUserProfileReq;
}

/**
 * 프로필 저장. web 은 닉네임·이름·나머지를 각자 "수정" 버튼으로 따로 보내지만,
 * 폰에서는 한 화면에 저장 버튼이 셋이면 무엇이 저장됐는지 알 수 없어 하나로 묶는다.
 * 대신 호출은 그대로 세 갈래라, 어디서 멈췄는지를 에러에 실어 화면이 정확히 말하게 한다.
 *
 * 순서는 web 의 화면 순서와 같다 — 닉네임(중복 검사 후), 이름, 나머지.
 * 앞이 성공하고 뒤가 실패하면 앞의 것은 이미 서버에 남는다. 그래서 성공이든 실패든
 * 끝나면 프로필을 다시 받는다(onSettled) — 반쯤 저장된 채로 옛 값을 보여 주지 않는다.
 *
 * 캐시에 직접 써 넣지 않는 이유는 로그인 정보 화면과 같다: 세 PATCH 모두 본문이 없어
 * (data: null) 서버가 저장한 값을 돌려주지 않는다.
 */
export const useSaveProfile = () => {
  const queryClient = useQueryClient();
  const id = useUserAuthStore((s) => s.id);

  return useAppMutation<unknown, ProfileSaveError, SaveProfileInput>({
    mutationFn: async ({ nickname, name, profile }) => {
      if (nickname !== undefined) {
        // 가입 화면과 같은 검사다. 409 면 이미 쓰는 닉네임이라는 뜻이다.
        await postNicknameValidate(nickname).catch(() => {
          throw new ProfileSaveError("nickname-taken");
        });
        await updateUserProfileNickname({ nickname }).catch(() => {
          throw new ProfileSaveError("nickname");
        });
      }

      if (name !== undefined) {
        await updateUserProfileName({ name }).catch(() => {
          throw new ProfileSaveError("name");
        });
      }

      await updateUserProfile(profile).catch(() => {
        throw new ProfileSaveError("profile");
      });
    },
    onSettled: () =>
      void queryClient.invalidateQueries({ queryKey: userProfileKey(id) }),
  });
};
