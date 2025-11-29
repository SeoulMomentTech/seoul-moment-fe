import { useState } from "react";

import { Edit, Trash2, X, Image as ImageIcon } from "lucide-react";

import { ImageWithFallback } from "@shared/components/image-with-fallback";
import type { HomeBanner } from "@shared/services/banner";
import { uploadAdminImage } from "@shared/services/upload";

import { Button, Label } from "@seoul-moment/ui";

import {
  useCreateHomeBannerMutation,
  useDeleteHomeBannerMutation,
  useHomeBannerListQuery,
  useUpdateHomeBannerMutation,
} from "./hooks";

export function HomeBannersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 이미지 업로드 상태
  const [pcImageFile, setPcImageFile] = useState<File | null>(null);
  const [pcImagePreview, setPcImagePreview] = useState<string>("");
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

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
  const isSaving = isUploading || isCreating || isUpdating;
  const isSaveDisabled =
    isSaving || (!banner && (!pcImageFile || !mobileImageFile));

  const handlePcImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPcImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPcImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMobileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const response = await uploadAdminImage({
        base64,
        folder: "banner",
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!banner && (!pcImageFile || !mobileImageFile)) {
      alert("PC 이미지와 모바일 이미지를 모두 업로드해주세요.");
      return;
    }

    try {
      let pcImageUrl = banner?.image || "";
      let mobileImageUrl = banner?.mobileImage || "";

      // 새 이미지가 업로드된 경우에만 업로드 처리
      if (pcImageFile) {
        pcImageUrl = await uploadImage(pcImageFile);
      }
      if (mobileImageFile) {
        mobileImageUrl = await uploadImage(mobileImageFile);
      }

      if (banner) {
        await updateBanner({
          bannerId: banner.id,
          image: pcImageUrl,
          mobileImage: mobileImageUrl,
        });
      } else {
        await createBanner({
          image: pcImageUrl,
          mobileImage: mobileImageUrl,
        });
      }

      // 상태 초기화
      resetModal();
      alert(banner ? "배너가 수정되었습니다." : "배너가 등록되었습니다.");
    } catch (error) {
      console.error("배너 저장 오류:", error);
      alert("배너 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteBanner = async () => {
    if (!banner) return;
    const confirmed = confirm("정말 배너를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteBanner(banner.id);
      resetModal();
      alert("배너가 삭제되었습니다.");
    } catch (error) {
      console.error("배너 삭제 오류:", error);
      alert("배너 삭제 중 오류가 발생했습니다.");
    }
  };

  const openModal = () => {
    if (banner) {
      setPcImagePreview(banner.image);
      setMobileImagePreview(banner.mobileImage);
    }
    setIsModalOpen(true);
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setPcImageFile(null);
    setPcImagePreview("");
    setMobileImageFile(null);
    setMobileImagePreview("");
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={resetModal} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2>{banner ? "배너 수정" : "배너 등록"}</h2>
              <button
                className="rounded-sm opacity-70 hover:opacity-100"
                onClick={resetModal}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-6 text-sm text-gray-500">
              {banner
                ? "배너 이미지를 수정합니다."
                : "새로운 홈 배너를 등록합니다."}
            </p>

            <div className="mb-6 space-y-6">
              {/* PC 이미지 업로드 */}
              <div className="space-y-2">
                <Label htmlFor="pcImage">PC 이미지 (권장: 1920x600px)</Label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  {pcImagePreview ? (
                    <div className="space-y-4">
                      <img
                        alt="PC 배너 미리보기"
                        className="h-48 w-full rounded-lg object-cover"
                        src={pcImagePreview}
                      />
                      <Button
                        onClick={() => {
                          setPcImageFile(null);
                          setPcImagePreview("");
                        }}
                        size="sm"
                        variant="outline"
                      >
                        이미지 제거
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <label className="cursor-pointer" htmlFor="pcImage">
                          <span className="text-blue-600 hover:text-blue-500">
                            파일 선택
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            또는 드래그 앤 드롭
                          </span>
                        </label>
                        <input
                          accept="image/*"
                          className="hidden"
                          id="pcImage"
                          onChange={handlePcImageChange}
                          type="file"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (최대 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 모바일 이미지 업로드 */}
              <div className="space-y-2">
                <Label htmlFor="mobileImage">
                  모바일 이미지 (권장: 750x400px)
                </Label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  {mobileImagePreview ? (
                    <div className="space-y-4">
                      <img
                        alt="모바일 배너 미리보기"
                        className="h-48 w-full rounded-lg object-cover"
                        src={mobileImagePreview}
                      />
                      <Button
                        onClick={() => {
                          setMobileImageFile(null);
                          setMobileImagePreview("");
                        }}
                        size="sm"
                        variant="outline"
                      >
                        이미지 제거
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <label className="cursor-pointer" htmlFor="mobileImage">
                          <span className="text-blue-600 hover:text-blue-500">
                            파일 선택
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            또는 드래그 앤 드롭
                          </span>
                        </label>
                        <input
                          accept="image/*"
                          className="hidden"
                          id="mobileImage"
                          onChange={handleMobileImageChange}
                          type="file"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (최대 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={resetModal} variant="outline">
                취소
              </Button>
              <Button disabled={isSaveDisabled} onClick={handleSaveBanner}>
                {isSaving ? "저장 중..." : banner ? "수정" : "등록"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 배너 표시 */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          </div>
        ) : banner ? (
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-3">PC 배너</h3>
                <ImageWithFallback
                  alt="홈 배너 PC"
                  className="h-[600px] w-[1920px] rounded-lg border border-gray-200 object-cover"
                  height={600}
                  src={banner.image}
                  width={1920}
                />
              </div>
              <div>
                <h3 className="mb-3">모바일 배너</h3>
                <ImageWithFallback
                  alt="홈 배너 모바일"
                  className="h-[400px] w-[700px] rounded-lg border border-gray-200 object-cover"
                  height={400}
                  src={banner.mobileImage}
                  width={700}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-4">등록된 배너가 없습니다.</p>
            <Button onClick={openModal}>
              <Edit className="mr-2 h-4 w-4" />
              배너 등록
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
