import type { HTTPError } from "ky";

import { postUserSignUp, type UserSignUpPayload } from "@shared/services/auth";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

interface UseUserSignUpMutationOptions {
  onSuccess?(): void;
  onError?(error: HTTPError): void;
}

export default function useUserSignUpMutation({
  onSuccess,
  onError,
}: UseUserSignUpMutationOptions = {}) {
  return useAppMutation<unknown, HTTPError, UserSignUpPayload>({
    mutationFn: postUserSignUp,
    toastOnError: true,
    onSuccess: () => {
      onSuccess?.();
    },
    onError,
  });
}
