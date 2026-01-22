import type { ChangeEvent } from "react";

import { ImageUploader } from "@shared/components/image-uploader";
import { MultipleImageUpload } from "@shared/components/multi-image-upload";

interface ProductImageSectionProps {
  imageUrlList: string[];
  mainImagePreview: string;
  onImageUrlListChange(urls: string[]): void;
  onMainImageChange(event: ChangeEvent<HTMLInputElement>): void;
  onMainImageClear(): void;
}

export function ProductImageSection({
  imageUrlList,
  mainImagePreview,
  onImageUrlListChange,
  onMainImageChange,
  onMainImageClear,
}: ProductImageSectionProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-base font-semibold">상품 이미지</h3>
        <p className="mt-1 text-sm text-gray-600">
          대표 이미지와 상세 이미지를 업로드하세요.
        </p>
      </div>
      <div className="space-y-6 px-6 py-5">
        <ImageUploader
          id="mainImage"
          label="대표 이미지"
          onChange={onMainImageChange}
          onClear={onMainImageClear}
          preview={mainImagePreview}
          required
        />

        <MultipleImageUpload
          folder="product"
          label="상세 이미지"
          maxImages={10}
          onChange={onImageUrlListChange}
          value={imageUrlList}
        />
      </div>
    </div>
  );
}
