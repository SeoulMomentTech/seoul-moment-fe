import { fetcher } from ".";

interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export interface AdminUploadImageRequest {
  base64: string;
  folder: string;
}

export interface AdminUploadImageResponse {
  imageUrl: string;
}

export const uploadAdminImage = (payload: AdminUploadImageRequest) =>
  fetcher.post<ApiResponse<AdminUploadImageResponse>>(
    "/admin/image/upload",
    payload,
  );
