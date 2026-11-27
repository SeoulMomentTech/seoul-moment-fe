"use client";

import { useId, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useUserOrderCancelRequestMutation } from "@entities/order";
import { formatTaipeiDateTime } from "@entities/payment";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  Textarea,
  VStack,
} from "@seoul-moment/ui";

import { CANCEL_REASON_MAX } from "../model/orderCancel";

interface OrderCancelRequestDialogProps {
  orderId: number;
  open: boolean;
  /** 간편취소 구간이면 그 끝 시각. 안내 문구만 바뀐다 */
  quickCancelUntil: string | null;
  onOpenChange(open: boolean): void;
}

/**
 * 취소·계약해제 신청. 사유는 선택이다. 응답이 204 뿐이라 자동 환불 여부는 주문 상세를
 * 다시 불러 취소·환불 영역에서 보인다.
 */
export function OrderCancelRequestDialog({
  orderId,
  open,
  quickCancelUntil,
  onOpenChange,
}: OrderCancelRequestDialogProps) {
  const t = useTranslations();
  const reasonId = useId();
  const [reason, setReason] = useState("");
  const mutation = useUserOrderCancelRequestMutation();

  const close = () => {
    if (mutation.isPending) return;
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (mutation.isPending) return;
    mutation.mutate(
      { orderId, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(t("order_cancel_done"));
          setReason("");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(
            t(
              error.response?.status === 409
                ? "order_cancel_not_allowed"
                : "order_cancel_failed",
            ),
          );
        },
      },
    );
  };

  return (
    <Dialog
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      open={open}
    >
      <DialogContent
        className={cn(
          "gap-0 border-0 bg-white p-[24px]",
          "sm:w-[440px] sm:max-w-[440px] sm:rounded-[8px]",
        )}
        showCloseButton={false}
      >
        <VStack className="w-full" gap={12}>
          <DialogTitle className="text-title-4 text-foreground text-left font-semibold leading-tight">
            {t("order_cancel_dialog_title")}
          </DialogTitle>
          <DialogDescription className="text-body-3 text-left leading-normal text-black/60">
            {quickCancelUntil
              ? t("order_cancel_quick_hint", {
                  time: formatTaipeiDateTime(quickCancelUntil),
                })
              : t("order_cancel_hint")}
          </DialogDescription>
        </VStack>

        <div className="mt-[20px] grid gap-[8px]">
          <label className="text-body-4 font-semibold" htmlFor={reasonId}>
            {t("order_cancel_reason_label")}
          </label>
          <Textarea
            className="h-[100px] resize-none"
            disabled={mutation.isPending}
            id={reasonId}
            maxLength={CANCEL_REASON_MAX}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("order_cancel_reason_placeholder")}
            value={reason}
          />
          <p className="text-body-5 text-right tabular-nums text-black/40">
            {reason.length}/{CANCEL_REASON_MAX}
          </p>
        </div>

        <DialogFooter className="mt-[20px] flex-row gap-[8px]">
          <Button
            className="flex-1 rounded-[4px] border-black/20 py-[12px] font-semibold text-black"
            disabled={mutation.isPending}
            onClick={close}
            type="button"
            variant="outline"
          >
            {t("close")}
          </Button>
          <Button
            className="flex-1 rounded-[4px] bg-black py-[12px] font-semibold text-white"
            disabled={mutation.isPending}
            onClick={handleSubmit}
            type="button"
          >
            {t(
              mutation.isPending
                ? "order_cancel_submitting"
                : "order_cancel_request",
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
