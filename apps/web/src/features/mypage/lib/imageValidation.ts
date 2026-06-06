export const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * 검증 실패 시 i18n 메시지 키를 반환한다(호출부에서 `t()`로 변환).
 * 통과 시 null.
 */
export function validateProfileImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "image_only";
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE) {
    return "file_size_limit";
  }

  return null;
}
