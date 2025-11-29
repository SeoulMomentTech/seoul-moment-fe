import { useEffect, useMemo, useState } from "react";

import { Image as ImageIcon, X } from "lucide-react";

import { uploadImageFile } from "@shared/utils/image";

import { Button, Label } from "@seoul-moment/ui";

interface BannerModalProps {
  isOpen: boolean;
  isSaving: boolean;
  initialPcImageUrl?: string;
  initialMobileImageUrl?: string;
  onClose(): void;
  onSave(payload: { image: string; mobileImage: string }): Promise<void>;
}

export function BannerModal({
  isOpen,
  isSaving,
  initialPcImageUrl,
  initialMobileImageUrl,
  onClose,
  onSave,
}: BannerModalProps) {
  const [pcImageFile, setPcImageFile] = useState<File | null>(null);
  const [pcImagePreview, setPcImagePreview] = useState<string>(
    initialPcImageUrl ?? "",
  );
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string>(
    initialMobileImageUrl ?? "",
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPcImagePreview(initialPcImageUrl ?? "");
      setMobileImagePreview(initialMobileImageUrl ?? "");
      setPcImageFile(null);
      setMobileImageFile(null);
    }
  }, [initialMobileImageUrl, initialPcImageUrl, isOpen]);

  const hasAllImages = useMemo(
    () => Boolean(pcImagePreview) && Boolean(mobileImagePreview),
    [pcImagePreview, mobileImagePreview],
  );

  if (!isOpen) return null;

  const handlePcImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPcImageFile(file);
      setPcImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMobileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileImageFile(file);
      setMobileImagePreview(URL.createObjectURL(file));
    }
  };

  const resetState = () => {
    setPcImageFile(null);
    setPcImagePreview(initialPcImageUrl ?? "");
    setMobileImageFile(null);
    setMobileImagePreview(initialMobileImageUrl ?? "");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSave = async () => {
    if (!hasAllImages) {
      alert("PC 이미지와 모바일 이미지를 모두 업로드해주세요.");
      return;
    }

    try {
      setIsUploading(true);
      const pcImageUrl = pcImageFile
        ? await uploadImageFile(pcImageFile, "banner")
        : pcImagePreview;
      const mobileImageUrl = mobileImageFile
        ? await uploadImageFile(mobileImageFile, "banner")
        : mobileImagePreview;

      await onSave({
        image: pcImageUrl,
        mobileImage: mobileImageUrl,
      });
      handleClose();
    } catch (error) {
      console.error("배너 저장 오류:", error);
      alert("배너 저장 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const isSaveDisabled = isSaving || isUploading || !hasAllImages;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2>{initialPcImageUrl ? "배너 수정" : "배너 등록"}</h2>
          <button
            className="rounded-sm opacity-70 hover:opacity-100"
            onClick={handleClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          {initialPcImageUrl
            ? "배너 이미지를 수정합니다."
            : "새로운 홈 배너를 등록합니다."}
        </p>

        <div className="mb-6 space-y-6">
          <ImageUploader
            id="pcImage"
            label="PC 이미지 (권장: 1920x600px)"
            onChange={handlePcImageChange}
            onClear={() => {
              setPcImageFile(null);
              setPcImagePreview("");
            }}
            preview={pcImagePreview}
          />

          <ImageUploader
            id="mobileImage"
            label="모바일 이미지 (권장: 750x400px)"
            onChange={handleMobileImageChange}
            onClear={() => {
              setMobileImageFile(null);
              setMobileImagePreview("");
            }}
            preview={mobileImagePreview}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleClose} variant="outline">
            취소
          </Button>
          <Button disabled={isSaveDisabled} onClick={handleSave}>
            {isSaving || isUploading
              ? "저장 중..."
              : initialPcImageUrl
                ? "수정"
                : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ImageUploaderProps {
  id: string;
  label: string;
  preview: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  onClear(): void;
}

function ImageUploader({
  id,
  label,
  preview,
  onChange,
  onClear,
}: ImageUploaderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        {preview ? (
          <div className="space-y-4">
            <img
              alt={`${label} 미리보기`}
              className="h-48 w-full rounded-lg object-cover"
              src={preview}
            />
            <Button onClick={onClear} size="sm" variant="outline">
              이미지 제거
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <label className="cursor-pointer" htmlFor={id}>
                <span className="text-blue-600 hover:text-blue-500">
                  파일 선택
                </span>
                <span className="text-gray-500"> 또는 드래그 앤 드롭</span>
              </label>
              <input
                accept="image/*"
                className="hidden"
                id={id}
                onChange={onChange}
                type="file"
              />
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}
