"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  VStack,
} from "@seoul-moment/ui";

import { useDeleteUserProfileImageMutation } from "../api/useDeleteUserProfileImageMutation";

interface DeleteProfileImageDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function DeleteProfileImageDialog({
  open,
  onOpenChange,
}: DeleteProfileImageDialogProps) {
  const t = useTranslations();
  const deleteMutation = useDeleteUserProfileImageMutation();

  const handleConfirm = () => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("profile_image_deleted"));
        onOpenChange(false);
      },
    });
  };

  const handleCancel = () => {
    if (deleteMutation.isPending) return;
    onOpenChange(false);
  };

  return (
    <Dialog
      onOpenChange={(next) => {
        if (deleteMutation.isPending) return;
        onOpenChange(next);
      }}
      open={open}
    >
      <DialogContent
        className={cn(
          "gap-0 border-0 bg-white p-[24px]",
          "sm:w-[400px] sm:max-w-[400px] sm:rounded-[8px]",
        )}
        showCloseButton={false}
      >
        <VStack className="w-full" gap={12}>
          <DialogTitle className="text-title-4 text-foreground text-left font-semibold leading-tight">
            {t("delete_profile_image")}
          </DialogTitle>
          <DialogDescription className="text-body-3 text-left leading-normal text-black/60">
            {t("delete_profile_image2")}
          </DialogDescription>
        </VStack>

        <DialogFooter className="mt-[24px] flex-row gap-[8px]">
          <Button
            className="flex-1 rounded-[4px] border-black/20 py-[12px] font-semibold text-black"
            disabled={deleteMutation.isPending}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            {t("cancel")}
          </Button>
          <Button
            className="flex-1 rounded-[4px] bg-black py-[12px] font-semibold text-white"
            disabled={deleteMutation.isPending}
            onClick={handleConfirm}
            type="button"
          >
            {deleteMutation.isPending ? t("deleting") : t("remove")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
