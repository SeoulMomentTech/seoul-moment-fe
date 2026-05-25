"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { debounce } from "es-toolkit";
import type { HTTPError } from "ky";

import { postNicknameValidate } from "@shared/services/auth";

const DEFAULT_DEBOUNCE_MS = 400;
const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 20;

export type NicknameValidateStatus =
  | "idle"
  | "checking"
  | "available"
  | "duplicated"
  | "error";

export interface UseNicknameValidateParams {
  nickname: string;
  enabled?: boolean;
  delay?: number;
}

export interface UseNicknameValidateResult {
  status: NicknameValidateStatus;
  message: string | null;
  isAvailable: boolean;
}

const MESSAGES: Record<NicknameValidateStatus, string | null> = {
  idle: null,
  checking: null,
  available: "사용 가능한 닉네임입니다.",
  duplicated: "이미 사용 중인 닉네임입니다.",
  error: "닉네임 확인에 실패했습니다. 다시 시도해주세요.",
};

const isValidLength = (value: string) =>
  value.length >= MIN_NICKNAME_LENGTH && value.length <= MAX_NICKNAME_LENGTH;

export function useNicknameValidate({
  nickname,
  enabled = true,
  delay = DEFAULT_DEBOUNCE_MS,
}: UseNicknameValidateParams): UseNicknameValidateResult {
  const [status, setStatus] = useState<NicknameValidateStatus>("idle");
  const latestNicknameRef = useRef(nickname);

  const flushValidate = useMemo(
    () =>
      debounce((value: string) => {
        postNicknameValidate({ nickname: value })
          .then(() => {
            if (latestNicknameRef.current !== value) return;
            setStatus("available");
          })
          .catch((error: HTTPError) => {
            if (latestNicknameRef.current !== value) return;
            const httpStatus = error?.response?.status;
            setStatus(httpStatus === 409 ? "duplicated" : "error");
          });
      }, delay),
    [delay],
  );

  useEffect(() => {
    latestNicknameRef.current = nickname;

    if (!enabled || !isValidLength(nickname)) {
      flushValidate.cancel();
      setStatus("idle");
      return;
    }

    setStatus("checking");
    flushValidate(nickname);
  }, [nickname, enabled, flushValidate]);

  useEffect(() => {
    return () => {
      flushValidate.cancel();
    };
  }, [flushValidate]);

  return {
    status,
    message: MESSAGES[status],
    isAvailable: status === "available",
  };
}
