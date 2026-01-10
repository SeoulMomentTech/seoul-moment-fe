import { ImageIcon } from "lucide-react";

import { Button, Label } from "@seoul-moment/ui";

interface ImageUploaderProps {
  id: string;
  label: string;
  preview: string;
  required?: boolean;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  onClear(): void;
}

export function ImageUploader({
  id,
  label,
  preview,
  required = false,
  onChange,
  onClear,
}: ImageUploaderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
        {preview ? (
          <div className="space-y-4">
            <img
              alt={`${label} 미리보기`}
              className="h-48 w-full rounded-lg"
              src={preview}
            />
            <Button onClick={onClear} size="sm" type="button" variant="outline">
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
