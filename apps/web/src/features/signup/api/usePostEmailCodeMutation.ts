import type { HTTPError } from "ky";

import { postEmailCode } from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UsePostEmailCodeMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export default function usePostEmailCodeMutation({
  onSuccess,
  onError,
}: UsePostEmailCodeMutationOptions = {}) {
  return useAppMutation<{ success: boolean }, HTTPError, string>({
    mutationFn: postEmailCode,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
