import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useCreateUserProfileImageMutation } from "../api/useCreateUserProfileImageMutation";
import { useUploadUserImageFileMutation } from "../api/useUploadUserImageFileMutation";
import { validateProfileImageFile } from "../lib/imageValidation";

const DEFAULT_FILE_NAME = "profile.jpg";

export function useProfileImageUpload() {
  const t = useTranslations();
  const { mutate: uploadImage, isPending: uploading } =
    useUploadUserImageFileMutation();
  const { mutate: registerProfileImage, isPending: registeringImage } =
    useCreateUserProfileImageMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState(DEFAULT_FILE_NAME);

  const isImageUpdating = uploading || registeringImage;

  // object URL은 src가 바뀌거나(재선택) 언마운트될 때 해제한다.
  useEffect(() => {
    return () => {
      if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    };
  }, [cropImageSrc]);

  const openFilePicker = () => {
    if (isImageUpdating) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const errorKey = validateProfileImageFile(file);
    if (errorKey) {
      toast.error(t(errorKey));
      return;
    }

    setCropImageSrc(URL.createObjectURL(file));
    setCropFileName(file.name);
    setIsCropDialogOpen(true);
  };

  const closeCropDialog = () => {
    setIsCropDialogOpen(false);
    setCropImageSrc(null);
  };

  const handleCropConfirm = (croppedFile: File) => {
    uploadImage(croppedFile, {
      onSuccess: (res) => {
        registerProfileImage(
          { imageUrl: res.data.imageUrl },
          {
            onSuccess: () => {
              toast.success(t("profile_image_updated"));
              closeCropDialog();
            },
          },
        );
      },
    });
  };

  return {
    fileInputRef,
    isCropDialogOpen,
    cropImageSrc,
    cropFileName,
    isImageUpdating,
    openFilePicker,
    handleFileChange,
    closeCropDialog,
    handleCropConfirm,
  };
}
