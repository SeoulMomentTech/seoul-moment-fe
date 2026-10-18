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

// 업로드는 base64 본문 전송 + 서버 쪽 이미지 처리까지 기다려야 해서
// 큰 상세 이미지는 공통 timeout(10초)을 넘긴다. 업로드에만 상한을 넉넉히 둔다.
const UPLOAD_TIMEOUT_MS = 120_000;

export const uploadAdminImage = (payload: AdminUploadImageRequest) =>
  fetcher.post<ApiResponse<AdminUploadImageResponse>>(
    "/admin/image/upload",
    payload,
    { timeout: UPLOAD_TIMEOUT_MS },
  );
