"use client";

import useAppMutation from "@shared/lib/hooks/query/useAppMutation";

import {
  sendChatMessage,
  type SendChatMessageReq,
  type SendChatMessageRes,
} from "./sendChatMessage";

/**
 * 배럴(@shared/lib/hooks)이 아니라 직접 경로로 import 한다 — 배럴의 export 이름에
 * `useAppMutaion` 오타가 있어 그 이름을 더 퍼뜨리지 않는다.
 *
 * toastOnError 를 켜지 않는다: sonner 는 z-index 999999999 로 패널을 덮어버린다.
 * 에러는 대화 흐름 안에 인라인으로 표시하는 게 맞다(ChatErrorNotice).
 */
export const useSendChatMessageMutation = () =>
  useAppMutation<SendChatMessageRes, unknown, SendChatMessageReq>({
    mutationFn: sendChatMessage,
    logOnError: true,
    toastOnError: false,
  });
