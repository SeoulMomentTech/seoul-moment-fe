"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { toast } from "sonner";

import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  VStack,
} from "@seoul-moment/ui";

import { getCroppedImageFile } from "../lib/cropImage";

interface ProfileImageCropDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  imageSrc: string | null;
  fileName: string;
  isProcessing: boolean;
  onCropConfirm(file: File): void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export function ProfileImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  fileName,
  isProcessing,
  onCropConfirm,
}: ProfileImageCropDialogProps) {
  const t = useTranslations();

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const resetState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);
    setCroppedAreaPixels(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (isProcessing) return;
    if (!next) resetState();
    onOpenChange(next);
  };

  const handleCancel = () => {
    if (isProcessing) return;
    resetState();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (isProcessing || !imageSrc || !croppedAreaPixels) return;

    try {
      const croppedFile = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        fileName,
      );
      onCropConfirm(croppedFile);
    } catch {
      toast.error(t("image_crop_failed"));
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent
        className={cn(
          "gap-0 border-0 bg-white",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[8px] p-[20px]",
          "sm:w-[400px] sm:max-w-[400px] sm:p-[24px]",
        )}
        showCloseButton={false}
      >
        <VStack className="w-full" gap={12}>
          <DialogTitle className="text-title-4 text-foreground text-left font-semibold leading-tight">
            {t("crop_profile_image")}
          </DialogTitle>

          <div className="relative mx-auto aspect-square max-h-[55dvh] w-full max-w-[calc(55dvh)] overflow-hidden rounded-[8px] bg-black/80 sm:max-h-none sm:max-w-none">
            {imageSrc ? (
              <Cropper
                aspect={1}
                crop={crop}
                cropShape="round"
                image={imageSrc}
                onCropChange={setCrop}
                onCropComplete={(_, areaPixels) =>
                  setCroppedAreaPixels(areaPixels)
                }
                onZoomChange={setZoom}
                showGrid={false}
                zoom={zoom}
              />
            ) : null}
          </div>

          <VStack className="w-full" gap={6}>
            <span className="text-body-3 text-black/60">{t("zoom")}</span>
            <input
              className="w-full accent-black"
              max={MAX_ZOOM}
              min={MIN_ZOOM}
              onChange={(event) => setZoom(Number(event.target.value))}
              step={ZOOM_STEP}
              type="range"
              value={zoom}
            />
          </VStack>
        </VStack>

        <DialogFooter className="mt-[20px] flex-row gap-[8px] sm:mt-[24px]">
          <Button
            className="flex-1 rounded-[4px] border-black/20 py-[12px] font-semibold text-black"
            disabled={isProcessing}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            {t("cancel")}
          </Button>
          <Button
            className="flex-1 rounded-[4px] bg-black py-[12px] font-semibold text-white"
            disabled={isProcessing || !croppedAreaPixels}
            onClick={handleConfirm}
            type="button"
          >
            {isProcessing ? t("uploading") : t("apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
