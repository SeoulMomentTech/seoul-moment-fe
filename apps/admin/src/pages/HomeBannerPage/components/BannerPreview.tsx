import { Edit, Image as ImageIcon } from "lucide-react";

import { ImageWithFallback } from "@shared/components/image-with-fallback";
import type { HomeBanner } from "@shared/services/banner";

import { Button } from "@seoul-moment/ui";

interface BannerPreviewProps {
  banner: HomeBanner | null;
  isLoading: boolean;
  onCreate(): void;
}

export function BannerPreview({
  banner,
  isLoading,
  onCreate,
}: BannerPreviewProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="py-12 text-center text-gray-500">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-4">등록된 배너가 없습니다.</p>
          <Button onClick={onCreate}>
            <Edit className="mr-2 h-4 w-4" />
            배너 등록
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="mb-3">PC 배너</h3>
            <ImageWithFallback
              alt="홈 배너 PC"
              className="h-[600px] w-full max-w-[1920px] rounded-lg border border-gray-200 object-cover"
              height={600}
              src={banner.image}
              width={1920}
            />
          </div>
          <div>
            <h3 className="mb-3">모바일 배너</h3>
            <ImageWithFallback
              alt="홈 배너 모바일"
              className="h-[400px] w-full max-w-[700px] rounded-lg border border-gray-200 object-cover"
              height={400}
              src={banner.mobileImage}
              width={700}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
