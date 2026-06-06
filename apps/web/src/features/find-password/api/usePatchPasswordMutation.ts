import type { HTTPError } from "ky";

import {
  patchPassword,
  type PatchPasswordPayload,
} from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UsePatchPasswordMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export function usePatchPasswordMutation({
  onSuccess,
  onError,
}: UsePatchPasswordMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, PatchPasswordPayload>({
    mutationFn: patchPassword,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
