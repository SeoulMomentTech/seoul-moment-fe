import type { ChangeEvent } from "react";

import { ImageUploader } from "@shared/components/image-uploader";

interface NewsImageFieldsProps {
  previews: {
    banner: string;
    profile: string;
    homeImage: string;
  };
  errors: Record<string, string | undefined>;
  onChange(
    field: "banner" | "profile" | "homeImage",
  ): (e: ChangeEvent<HTMLInputElement>) => void;
  onClear(field: "banner" | "profile" | "homeImage"): void;
}

export function NewsImageFields({
  previews,
  errors,
  onChange,
  onClear,
}: NewsImageFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ImageUploader
          id="news-banner"
          label="배너 이미지 (권장: 1200x600px)"
          onChange={onChange("banner")}
          onClear={() => onClear("banner")}
          preview={previews.banner}
        />
        {errors.banner && (
          <p className="text-sm text-red-500">{errors.banner}</p>
        )}
      </div>
      <div className="space-y-2">
        <ImageUploader
          id="news-profile"
          label="작성자 프로필 이미지 (권장: 400x400px)"
          onChange={onChange("profile")}
          onClear={() => onClear("profile")}
          preview={previews.profile}
        />
        {errors.profile && (
          <p className="text-sm text-red-500">{errors.profile}</p>
        )}
      </div>
      <div className="space-y-2">
        <ImageUploader
          id="news-home"
          label="홈 이미지 (권장: 1200x600px)"
          onChange={onChange("homeImage")}
          onClear={() => onClear("homeImage")}
          preview={previews.homeImage}
        />
        {errors.homeImage && (
          <p className="text-sm text-red-500">{errors.homeImage}</p>
        )}
      </div>
    </div>
  );
}
