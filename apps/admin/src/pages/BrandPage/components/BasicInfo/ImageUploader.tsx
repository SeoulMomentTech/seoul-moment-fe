import { type ReactNode } from "react";

import { Upload } from "lucide-react";

import { Button, Label } from "@seoul-moment/ui";

export type ImageAspect = "square" | "wide";

export interface ImageUploaderProps {
  label: ReactNode;
  description?: string;
  value: string;
  error?: string;
  onChange(file?: File): void;
  onClear(): void;
  aspect?: ImageAspect;
}

export function ImageUploader({
  label,
  description,
  value,
  error,
  onChange,
  onClear,
  aspect = "square",
}: ImageUploaderProps) {
  const altText = typeof label === "string" ? label : "이미지 업로드";
  const sizeClass =
    aspect === "wide" ? "aspect-21/9 w-full max-w-2xl" : "h-48 w-48 max-w-xs";

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {description && <p className="text-sm text-gray-500">{description}</p>}

      {value ? (
        <div className={`relative ${aspect === "wide" ? "max-w-2xl" : ""}`}>
          <img
            alt={altText}
            className={`${sizeClass} rounded-lg border-2 border-gray-200 object-cover`}
            src={value}
          />
          <Button
            className="absolute right-2 top-2"
            onClick={onClear}
            size="sm"
            type="button"
            variant="destructive"
          >
            변경
          </Button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            } ${sizeClass}`}
          >
            <div
              className={`mb-2 flex items-center justify-center rounded-full bg-gray-100 ${
                aspect === "wide" ? "h-16 w-16" : "h-12 w-12"
              }`}
            >
              <Upload className={aspect === "wide" ? "h-8 w-8" : "h-6 w-6"} />
            </div>
            <p className="mb-1 text-sm text-gray-600">이미지 업로드</p>
            <p className="text-xs text-gray-500">
              {aspect === "wide"
                ? "와이드 이미지 권장 (21:9 비율)"
                : "정사각형 이미지 권장"}
            </p>
          </div>
          <input
            accept="image/*"
            className="hidden"
            onChange={(e) => onChange(e.target.files?.[0])}
            type="file"
          />
        </label>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
