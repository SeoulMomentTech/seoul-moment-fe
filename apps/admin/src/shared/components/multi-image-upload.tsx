import { useState, useRef } from "react";

import { Upload, X } from "lucide-react";

import { uploadImageFile } from "@shared/utils/image";

import { Button, Label } from "@seoul-moment/ui";

interface MultipleImageUploadProps {
  value: string[];
  onChange(urls: string[]): void;
  label?: string;
  maxImages?: number;
  folder?: string;
  required?: boolean;
}

export function MultipleImageUpload({
  value,
  onChange,
  label,
  maxImages = 10,
  folder = "brand",
  required = false,
}: MultipleImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    const remainingSlots = maxImages - value.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const validFiles = filesToProcess.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (validFiles.length === 0) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const urls = await Promise.all(
        validFiles.map((file) =>
          uploadImageFile(file, folder).then((res) => res.imageUrl),
        ),
      );
      onChange([...value, ...urls]);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      void handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void handleFileSelect(e.target.files);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const canAddMore = value.length < maxImages && !isUploading;

  return (
    <div className="space-y-3">
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div className="group relative" key={`${url}-${index + 1}`}>
              <img
                alt={`Image ${index + 1}`}
                className="h-24 w-full rounded-lg border border-gray-200 object-cover"
                src={url}
              />
              <Button
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(index)}
                size="sm"
                type="button"
                variant="destructive"
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="mb-1 text-sm text-gray-600">
            클릭하여 이미지를 업로드하거나
          </p>
          <p className="mb-2 text-sm text-gray-500">드래그 앤 드롭하세요</p>
          <p className="text-xs text-gray-400">
            ({value.length}/{maxImages})
          </p>
          <input
            accept="image/*"
            className="hidden"
            multiple
            onChange={handleFileInputChange}
            ref={fileInputRef}
            type="file"
          />
          {isUploading && (
            <p className="mt-2 text-xs text-gray-500">업로드 중...</p>
          )}
        </div>
      )}

      {!canAddMore && (
        <p className="text-center text-sm text-gray-500">
          최대 {maxImages}개까지 업로드 가능합니다.
        </p>
      )}
    </div>
  );
}
