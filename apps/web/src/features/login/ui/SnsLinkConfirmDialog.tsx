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
import { useLineLinkMutation } from "../api/useLineLinkMutation";
import type { SnsProvider } from "../lib/snsAuthStorage";

const TEXT_KEYS = {
  google: {
    title: "connect_google_to_existing_account",
    description: "connect_account_to_google",
    failed: "connect_google_failed",
  },
  line: {
    title: "connect_line_to_existing_account",
    description: "connect_account_to_line",
    failed: "connect_line_failed",
  },
} as const satisfies Record<SnsProvider, Record<string, string>>;

interface SnsLinkConfirmDialogProps {
  open: boolean;
  provider: SnsProvider;
  email: string;
  linkToken: string;
  onOpenChange(open: boolean): void;
  onLinked?(): void;
}

export function SnsLinkConfirmDialog({
  open,
  provider,
  email,
  linkToken,
  onOpenChange,
  onLinked,
}: SnsLinkConfirmDialogProps) {
  const t = useTranslations();
  const textKeys = TEXT_KEYS[provider];

  const handleSuccess = () => {
    onOpenChange(false);
    onLinked?.();
  };

  const handleError = () => {
    toast.error(t(textKeys.failed));
    onOpenChange(false);
  };

  // 훅은 조건부로 호출할 수 없으므로 둘 다 생성하고 provider 로 골라 쓴다.
  // 실제로 요청을 보내는 쪽만 동작하므로 부작용은 없다.
  const googleLinkMutation = useGoogleLinkMutation({
    onSuccess: handleSuccess,
    onError: handleError,
  });
  const lineLinkMutation = useLineLinkMutation({
    onSuccess: handleSuccess,
    onError: handleError,
  });
  const linkMutation =
    provider === "line" ? lineLinkMutation : googleLinkMutation;

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
            {t(textKeys.title)}
          </DialogTitle>
          <DialogDescription className="text-body-3 text-left leading-normal text-black/60">
            <strong className="font-semibold text-black/80">{email}</strong>{" "}
            {t("account_exists")}
            <br />
            {t(textKeys.description)}
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
