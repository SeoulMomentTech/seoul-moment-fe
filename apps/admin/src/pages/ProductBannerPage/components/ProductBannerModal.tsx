import { useEffect, useMemo, useState } from "react";

import { X } from "lucide-react";

import { ImageUploader } from "@shared/components/image-uploader";
import { uploadImageFile } from "@shared/utils/image";

import { Button, Flex, HStack } from "@seoul-moment/ui";

interface ProductBannerModalProps {
  isOpen: boolean;
  isSaving: boolean;
  initialImageUrl?: string;
  onClose(): void;
  onSave(payload: { imageUrl: string }): Promise<void>;
}

export function ProductBannerModal({
  isOpen,
  isSaving,
  initialImageUrl,
  onClose,
  onSave,
}: ProductBannerModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialImageUrl ?? "",
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setImagePreview(initialImageUrl ?? "");
      setImageFile(null);
    }
  }, [initialImageUrl, isOpen]);

  const hasImage = useMemo(() => Boolean(imagePreview), [imagePreview]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetState = () => {
    setImageFile(null);
    setImagePreview(initialImageUrl ?? "");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSave = async () => {
    if (!hasImage) {
      alert("배너 이미지를 업로드해주세요.");
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = imageFile
        ? (await uploadImageFile(imageFile, "banner")).imagePath
        : imagePreview;

      await onSave({ imageUrl });
      handleClose();
    } catch (error) {
      console.error("배너 저장 오류:", error);
      alert("배너 저장 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const isSaveDisabled = isSaving || isUploading || !hasImage;

  return (
    <HStack align="center" className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <HStack align="between" className="mb-4">
          <h2>{initialImageUrl ? "배너 수정" : "배너 등록"}</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={handleClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </HStack>
        <p className="mb-6 text-sm text-gray-500">
          {initialImageUrl
            ? "배너 이미지를 수정합니다."
            : "새로운 상품 배너를 등록합니다."}
        </p>

        <div className="mb-6">
          <input type="url" />
          <ImageUploader
            id="productBannerImage"
            label="배너 이미지 (권장: 1200x600px)"
            onChange={handleImageChange}
            onClear={() => {
              setImageFile(null);
              setImagePreview("");
            }}
            preview={imagePreview}
          />
        </div>

        <Flex gap={8} justify="flex-end">
          <Button onClick={handleClose} variant="outline">
            취소
          </Button>
          <Button disabled={isSaveDisabled} onClick={handleSave}>
            {isSaving || isUploading
              ? "저장 중..."
              : initialImageUrl
                ? "수정"
                : "등록"}
          </Button>
        </Flex>
      </div>
    </HStack>
  );
}
