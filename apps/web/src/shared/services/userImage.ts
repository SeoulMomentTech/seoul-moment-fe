import type { CommonRes } from "./";
import { api } from "./";

export type UserImageFolder = "profile";

export interface UploadUserImageReq {
  base64: string;
  folder: UserImageFolder;
}

export interface UploadUserImageRes {
  imageUrl: string;
  imagePath: string;
}

/**
 * @description 유저 이미지 업로드 (base64)
 */
export const uploadUserImage = (data: UploadUserImageReq) =>
  api
    .post("user/image/upload", {
      json: data,
    })
    .json<CommonRes<UploadUserImageRes>>();

export interface UploadUserImageFileReq {
  file: File | File[];
  folder: UserImageFolder;
}

/**
 * @description 유저 이미지 파일 업로드 (multipart)
 */
export const uploadUserImageFile = ({
  file,
  folder,
}: UploadUserImageFileReq) => {
  const formData = new FormData();

  const files = Array.isArray(file) ? file : [file];
  files.forEach((f) => formData.append("file", f));
  formData.append("folder", folder);

  return api
    .post("user/image/upload/file", {
      body: formData,
      headers: {
        "Content-Type": undefined,
      },
    })
    .json<CommonRes<UploadUserImageRes>>();
};
