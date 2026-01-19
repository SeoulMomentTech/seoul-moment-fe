import {
  ImageUploader,
  type ImageUploaderProps,
} from "./ImageUploader";

type SimpleImageUploaderProps = Pick<
  ImageUploaderProps,
  "value" | "error" | "onChange" | "onClear"
>;

export function ProfileImageUploader(props: SimpleImageUploaderProps) {
  return (
    <ImageUploader
      description="브랜드를 대표하는 로고 또는 이미지"
      label={
        <>
          프로필 이미지 <span className="text-red-500">*</span>
        </>
      }
      {...props}
    />
  );
}

export function BannerImageUploader(props: SimpleImageUploaderProps) {
  return (
    <ImageUploader
      aspect="wide"
      description="브랜드 페이지 상단에 노출되는 이미지"
      label="대표 배너 이미지"
      {...props}
    />
  );
}

export function BannerMobileImageUploader(props: SimpleImageUploaderProps) {
  return (
    <ImageUploader
      aspect="wide"
      description="브랜드 페이지 상단에 노출되는 모바일 이미지"
      label="대표 모바일 배너 이미지"
      {...props}
    />
  );
}

