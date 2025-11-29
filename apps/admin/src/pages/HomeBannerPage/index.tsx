import { useState } from "react";

import { Edit, Trash2 } from "lucide-react";

import type { HomeBanner } from "@shared/services/banner";

import { Button } from "@seoul-moment/ui";

import { BannerModal } from "./components/BannerModal";
import { BannerPreview } from "./components/BannerPreview";
import {
  useCreateHomeBannerMutation,
  useDeleteHomeBannerMutation,
  useHomeBannerListQuery,
  useUpdateHomeBannerMutation,
} from "./hooks";

export function HomeBannersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: bannerResponse,
    isLoading: isBannerLoading,
    isFetching: isBannerFetching,
  } = useHomeBannerListQuery();

  const banner: HomeBanner | null = bannerResponse?.data.list[0] ?? null;

  const { mutateAsync: createBanner, isPending: isCreating } =
    useCreateHomeBannerMutation();
  const { mutateAsync: updateBanner, isPending: isUpdating } =
    useUpdateHomeBannerMutation();
  const { mutateAsync: deleteBanner, isPending: isDeleting } =
    useDeleteHomeBannerMutation();

  const isLoading = isBannerLoading || isBannerFetching;
  const isSaving = isCreating || isUpdating;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSaveBanner = async (payload: {
    image: string;
    mobileImage: string;
  }) => {
    if (banner) {
      await updateBanner({
        bannerId: banner.id,
        image: payload.image,
        mobileImage: payload.mobileImage,
      });
      alert("배너가 수정되었습니다.");
      return;
    }

    await createBanner({
      image: payload.image,
      mobileImage: payload.mobileImage,
    });
    alert("배너가 등록되었습니다.");
  };

  const handleDeleteBanner = async () => {
    if (!banner) return;

    const confirmed = confirm("정말 배너를 삭제하시겠습니까?");

    if (!confirmed) return;

    try {
      await deleteBanner(banner.id);
      alert("배너가 삭제되었습니다.");
    } catch (error) {
      console.error("배너 삭제 오류:", error);
      alert("배너 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="p-8 pt-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2">홈 배너 관리</h1>
          <p className="text-gray-600">홈 페이지에 표시될 배너를 관리하세요.</p>
        </div>
        {banner && (
          <div className="flex gap-2">
            <Button onClick={openModal}>
              <Edit className="mr-2 h-4 w-4" />
              배너 수정
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDeleteBanner}
              variant="outline"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "삭제 중..." : "배너 삭제"}
            </Button>
          </div>
        )}
        {!banner && (
          <Button onClick={openModal}>
            <Edit className="mr-2 h-4 w-4" />
            배너 등록
          </Button>
        )}
      </div>

      {/* 배너 추가/수정 모달 */}
      <BannerModal
        initialMobileImageUrl={banner?.mobileImage}
        initialPcImageUrl={banner?.image}
        isOpen={isModalOpen}
        isSaving={isSaving}
        onClose={closeModal}
        onSave={handleSaveBanner}
      />

      <BannerPreview
        banner={banner}
        isLoading={isLoading}
        onCreate={openModal}
      />
    </div>
  );
}
