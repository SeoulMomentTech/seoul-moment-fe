import type { HTTPError } from "ky";

import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import type {
  LineEmailCodeReq,
  PostSnsLoginRes,
  PostSnsSignUpReq,
  UserLoginResponse,
} from "@shared/services/auth";
import {
  postLineEmailCode,
  postLineEmailVerify,
  postLineLink,
  postLineLogin,
  postLineSignUp,
} from "@shared/services/auth";

import type { CommonRes } from "@shared/services";

/** 1단계. id_token 을 넘기면 서버가 네 갈래 중 하나로 답한다(classifySnsAuthResponse). */
export const useLineLogin = () =>
  useAppMutation<CommonRes<PostSnsLoginRes>, HTTPError, string>({
    mutationFn: postLineLogin,
  });

/** 2-A. 기존 계정에 LINE 을 붙이고 로그인시킨다. 409 는 이미 연결된 계정이다. */
export const useLineLink = () =>
  useAppMutation<CommonRes<UserLoginResponse>, HTTPError, string>({
    mutationFn: postLineLink,
  });

/** 2-B. 이메일 가입과 달리 토큰을 바로 준다 — 끝나고 따로 로그인할 필요가 없다. */
export const useLineSignUp = () =>
  useAppMutation<CommonRes<UserLoginResponse>, HTTPError, PostSnsSignUpReq>({
    mutationFn: postLineSignUp,
  });

/** 1-B. LINE 이 이메일을 주지 않았을 때. */
export const useLineEmailCode = () =>
  useAppMutation<unknown, HTTPError, LineEmailCodeReq>({
    mutationFn: postLineEmailCode,
  });

/** 1-B. 통과하면 login 과 같은 모양이 와서 같은 판정을 다시 돌린다. */
export const useLineEmailVerify = () =>
  useAppMutation<
    CommonRes<PostSnsLoginRes>,
    HTTPError,
    LineEmailCodeReq & { code: string }
  >({ mutationFn: postLineEmailVerify });
