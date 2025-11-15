import NextImage, { type ImageProps } from "next/image";
import { BLUR_DATA_URL } from "@shared/constants/image";

export type BaseImageProps = ImageProps;

export function BaseImage({
  blurDataURL = BLUR_DATA_URL,
  placeholder = "blur",
  ...props
}: BaseImageProps) {
  return (
    <NextImage {...props} blurDataURL={blurDataURL} placeholder={placeholder} />
  );
}
