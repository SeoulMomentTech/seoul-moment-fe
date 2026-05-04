import type { HTTPError } from "ky";

import { verifyEmailCode } from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface VerifyEmailCodeVariables {
  email: string;
  code: string;
}

interface UseVerifyEmailCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export default function useVerifyEmailCodeMutation({
  onSuccess,
  onError,
}: UseVerifyEmailCodeMutationOptions = {}) {
  return useAppMutation<
    { success: boolean },
    HTTPError,
    VerifyEmailCodeVariables
  >({
    mutationFn: verifyEmailCode,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
