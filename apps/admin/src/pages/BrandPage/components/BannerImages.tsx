import { MultipleImageUpload } from "@shared/components/multi-image-upload";

interface BannerImagesProps {
  bannerImageUrlList: string[];
  bannerError?: string;
  setBannerImageUrlList(urls: string[]): void;
  mobileBannerImageUrlList: string[];
  mobileBannerError?: string;
  setMobileBannerImageUrlList(urls: string[]): void;
}

export function BannerImages({
  bannerImageUrlList,
  bannerError,
  setBannerImageUrlList,
  mobileBannerImageUrlList,
  mobileBannerError,
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
      {bannerError && (
        <p className="text-sm text-red-500">{bannerError}</p>
      )}

      <MultipleImageUpload
        label="모바일 배너 이미지(1.메인, 2.서브)"
        maxImages={2}
        onChange={setMobileBannerImageUrlList}
        value={mobileBannerImageUrlList}
      />
      {mobileBannerError && (
        <p className="text-sm text-red-500">{mobileBannerError}</p>
      )}
    </div>
  );
}
