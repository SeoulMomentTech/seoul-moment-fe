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
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <ImageUploader
          id="news-banner"
          label="배너 이미지"
          onChange={onChange("banner")}
          onClear={() => onClear("banner")}
          preview={previews.banner}
          required
        />
        {errors.banner && (
          <p className="text-sm text-red-500">{errors.banner}</p>
        )}
      </div>
      <div className="space-y-2">
        <ImageUploader
          id="news-profile"
          label="프로필 이미지"
          onChange={onChange("profile")}
          onClear={() => onClear("profile")}
          preview={previews.profile}
          required
        />
        {errors.profile && (
          <p className="text-sm text-red-500">{errors.profile}</p>
        )}
      </div>
      <div className="space-y-2">
        <ImageUploader
          id="news-home"
          label="홈 이미지"
          onChange={onChange("homeImage")}
          onClear={() => onClear("homeImage")}
          preview={previews.homeImage}
          required
        />
        {errors.homeImage && (
          <p className="text-sm text-red-500">{errors.homeImage}</p>
        )}
      </div>
    </div>
  );
}
