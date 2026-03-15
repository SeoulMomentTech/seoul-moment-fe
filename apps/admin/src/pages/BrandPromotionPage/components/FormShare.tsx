import type { ReactNode } from "react";

import { ImageUploader } from "@shared/components/image-uploader";
import { uploadImageFile } from "@shared/utils/image";

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-base font-semibold">{title}</h3>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-black/12 rounded-[12px] border bg-white p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-medium">{children}</label>;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

export function SingleImageField({
  folder = "brand",
  id,
  label,
  onChange,
  preview,
}: {
  folder?: string;
  id: string;
  label: string;
  onChange(url: string): void;
  preview: string;
}) {
  return (
    <ImageUploader
      id={id}
      label={label}
      onChange={async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const { imageUrl } = await uploadImageFile(file, folder);
        onChange(imageUrl);
      }}
      onClear={() => onChange("")}
      preview={preview}
    />
  );
}
