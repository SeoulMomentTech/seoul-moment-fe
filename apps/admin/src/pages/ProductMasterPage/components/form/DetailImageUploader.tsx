import type { ChangeEvent } from "react";

import { ImageUploader } from "@shared/components/image-uploader";
import { uploadImageFile } from "@shared/utils/image";


interface DetailImageUploaderProps {
  value: string;
  error?: string;
  onChange(url: string): void;
}

export const DetailImageUploader = ({
  value,
  error,
  onChange,
}: DetailImageUploaderProps) => {
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { imageUrl } = await uploadImageFile(file, "product");
      onChange(imageUrl);
    } catch (error) {
      console.error(error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-2">
      <ImageUploader
        id="detailInfoImageUrl"
        label="이미지 업로드"
        onChange={handleImageChange}
        onClear={() => onChange("")}
        preview={value}
        required
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
