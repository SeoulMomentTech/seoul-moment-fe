export const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateProfileImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "이미지 파일만 업로드 가능합니다.";
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    return "파일 크기는 5MB 이하여야 합니다.";
  }

  return null;
}
