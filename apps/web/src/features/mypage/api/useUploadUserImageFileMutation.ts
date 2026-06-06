import type { HTTPError } from "ky";

import { uploadUserImageFile } from "@shared/services/userImage";

import useAppMutation from "@/shared/lib/hooks/query/useAppMutation";

export function useUploadUserImageFileMutation() {
  return useAppMutation<
    Awaited<ReturnType<typeof uploadUserImageFile>>,
    HTTPError,
    File
  >({
    mutationFn: (file) => uploadUserImageFile({ file, folder: "profile" }),
    toastOnError: true,
  });
}
