import { ImageUploader } from "@shared/components/image-uploader";
import { useFormContext } from "react-hook-form";

import type { PromotionFormValues } from "../../hooks/usePromotionForm";

interface PromotionImagesProps {
  bannerPreview: string;
  mobileBannerPreview: string;
  thumbnailPreview: string;
  handleFileChange(field: "banner" | "mobileBanner" | "thumbnail"): (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleFileClear(field: "banner" | "mobileBanner" | "thumbnail"): () => void;
}

export function PromotionImages({
  bannerPreview,
  mobileBannerPreview,
  thumbnailPreview,
  handleFileChange,
  handleFileClear,
}: PromotionImagesProps) {
  const { formState: { isSubmitted } } = useFormContext<PromotionFormValues>();

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-base font-semibold">메인 이미지</h3>
        <p className="mt-1 text-sm text-gray-600">
          프로모션 배너 및 썸네일 이미지를 업로드하세요.
        </p>
      </div>
      <div className="px-6 py-5">
        <div className="grid gap-6 md:grid-cols-3">
          <ImageUploader
            id="promotion-banner"
            label="배너 이미지 (PC)"
            onChange={handleFileChange("banner")}
            onClear={handleFileClear("banner")}
            preview={bannerPreview}
            required
          />
          <ImageUploader
            id="promotion-mobile-banner"
            label="모바일 배너 이미지"
            onChange={handleFileChange("mobileBanner")}
            onClear={handleFileClear("mobileBanner")}
            preview={mobileBannerPreview}
            required
          />
          <ImageUploader
            id="promotion-thumbnail"
            label="썸네일 이미지"
            onChange={handleFileChange("thumbnail")}
            onClear={handleFileClear("thumbnail")}
            preview={thumbnailPreview}
            required
          />
        </div>
        {(!bannerPreview || !mobileBannerPreview || !thumbnailPreview) && isSubmitted && (
          <p className="mt-4 text-sm text-red-500">
            모든 이미지를 등록해야 합니다.
          </p>
        )}
      </div>
    </div>
  );
}
