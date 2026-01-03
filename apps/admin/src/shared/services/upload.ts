import { type ApiResponse } from "./types";

import { fetcher } from ".";

export interface AdminUploadImageRequest {
  base64: string;
  folder: string;
}

export interface AdminUploadImageResponse {
  imageUrl: string;
  imagePath: string;
}

export const uploadAdminImage = (payload: AdminUploadImageRequest) =>
  fetcher.post<ApiResponse<AdminUploadImageResponse>>(
    "/admin/image/upload",
    payload,
  );
