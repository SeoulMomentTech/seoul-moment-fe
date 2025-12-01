import { MultipleImageUpload } from "@shared/components/multi-image-upload";

interface BannerImagesProps {
  bannerImageUrlList: string[];
  setBannerImageUrlList(urls: string[]): void;
  mobileBannerImageUrlList: string[];
  setMobileBannerImageUrlList(urls: string[]): void;
}

export function BannerImages({
  bannerImageUrlList,
  setBannerImageUrlList,
  mobileBannerImageUrlList,
  setMobileBannerImageUrlList,
}: BannerImagesProps) {
  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <MultipleImageUpload
        label="PC 배너 이미지(1.메인, 2.서브)"
        maxImages={2}
        onChange={setBannerImageUrlList}
        value={bannerImageUrlList}
      />

      <MultipleImageUpload
        label="모바일 배너 이미지(1.메인, 2.서브)"
        maxImages={2}
        onChange={setMobileBannerImageUrlList}
        value={mobileBannerImageUrlList}
      />
    </div>
  );
}
