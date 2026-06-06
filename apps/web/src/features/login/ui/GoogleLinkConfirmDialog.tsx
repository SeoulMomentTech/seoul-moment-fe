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

import { useGoogleLinkMutation } from "../api/useGoogleLinkMutation";

interface GoogleLinkConfirmDialogProps {
  open: boolean;
  email: string;
  linkToken: string;
  onOpenChange(open: boolean): void;
  onLinked?(): void;
}

export function GoogleLinkConfirmDialog({
  open,
  email,
  linkToken,
  onOpenChange,
  onLinked,
}: GoogleLinkConfirmDialogProps) {
  const t = useTranslations();
  const linkMutation = useGoogleLinkMutation({
    onSuccess: () => {
      onOpenChange(false);
      onLinked?.();
    },
    onError: () => {
      toast.error(t("connect_google_failed"));
      onOpenChange(false);
    },
  });

  const handleConfirm = () => {
    if (linkMutation.isPending) return;
    linkMutation.mutate({ linkToken });
  };

  const handleCancel = () => {
    if (linkMutation.isPending) return;
    onOpenChange(false);
  };

  return (
    <Dialog
      onOpenChange={(next) => {
        if (linkMutation.isPending) return;
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
            {t("connect_google_to_existing_account")}
          </DialogTitle>
          <DialogDescription className="text-body-3 text-left leading-normal text-black/60">
            <strong className="font-semibold text-black/80">{email}</strong>{" "}
            {t("account_exists")}
            <br />
            {t("connect_account_to_google")}
          </DialogDescription>
        </VStack>

        <DialogFooter className="mt-[24px] flex-row gap-[8px]">
          <Button
            className="flex-1 rounded-[4px] border-black/20 py-[12px] font-semibold text-black"
            disabled={linkMutation.isPending}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            {t("cancel")}
          </Button>
          <Button
            className="flex-1 rounded-[4px] bg-black py-[12px] font-semibold text-white"
            disabled={linkMutation.isPending}
            onClick={handleConfirm}
            type="button"
          >
            {linkMutation.isPending ? t("connecting") : t("connect")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
