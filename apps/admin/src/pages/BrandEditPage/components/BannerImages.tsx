import { MultipleImageUpload } from "@shared/components/multi-image-upload";

interface BannerImagesTabProps {
  bannerImageUrlList: string[];
  setBannerImageUrlList(urls: string[]): void;
  mobileBannerImageUrlList: string[];
  setMobileBannerImageUrlList(urls: string[]): void;
}

export function BannerImagesTab({
  bannerImageUrlList,
  setBannerImageUrlList,
  mobileBannerImageUrlList,
  setMobileBannerImageUrlList,
}: BannerImagesTabProps) {
  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <MultipleImageUpload
        label="PC 배너 이미지"
        maxImages={1}
        onChange={setBannerImageUrlList}
        value={bannerImageUrlList}
      />

      <MultipleImageUpload
        label="모바일 배너 이미지"
        maxImages={1}
        onChange={setMobileBannerImageUrlList}
        value={mobileBannerImageUrlList}
      />
    </div>
  );
}
