import type { Area } from "react-easy-crop";

const OUTPUT_MIME = "image/jpeg";
const OUTPUT_QUALITY = 0.9;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (event) => reject(event);
    image.src = src;
  });
}

function replaceExtension(fileName: string): string {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return `${base || "profile"}.jpg`;
}

/**
 * react-easy-crop의 croppedAreaPixels와 원본 이미지 src를 받아
 * 해당 영역만 canvas에 그려 잘라낸 뒤 File로 반환한다.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  croppedAreaPixels: Area,
  fileName: string,
): Promise<File> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(croppedAreaPixels.width);
  canvas.height = Math.round(croppedAreaPixels.height);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas 2d context");
  }

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, OUTPUT_MIME, OUTPUT_QUALITY);
  });

  if (!blob) {
    throw new Error("Failed to create blob from canvas");
  }

  return new File([blob], replaceExtension(fileName), { type: OUTPUT_MIME });
}
