import { useRef, useState } from "react";

import { ImageIcon } from "lucide-react";

import { Button, cn, Label } from "@seoul-moment/ui";

interface ImageUploaderProps {
  id: string;
  label: string;
  preview: string;
  required?: boolean;
  imageClassName?: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
  onClear(): void;
}

export function ImageUploader({
  id,
  label,
  preview,
  imageClassName,
  required = false,
  onChange,
  onClear,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

    const file = e.dataTransfer.files[0];
    if (!file?.type.startsWith("image/")) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const input = inputRef.current;
    if (!input) return;

    input.files = dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>
      <div
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300",
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              alt={`${label} 미리보기`}
              className={cn("h-48 w-full rounded-lg", imageClassName)}
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
                ref={inputRef}
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
