import type { FormEvent, ReactNode } from "react";

import { CompactButton } from "@shared/components/compact-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@seoul-moment/ui";

interface OrderConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** 되돌릴 수 없거나 돈이 나가는 작업 */
  destructive?: boolean;
  isPending: boolean;
  /** 입력이 모자라 확인을 막을 때 */
  disabled?: boolean;
  /** 확인 전에 받을 입력칸 */
  children?: ReactNode;
  onConfirm(): void;
  onClose(): void;
}

/** 드로어 작업 확인 모달. 환불·철회처럼 오조작이 비싼 작업을 한 번 거친다 */
export function OrderConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  isPending,
  disabled = false,
  children,
  onConfirm,
  onClose,
}: OrderConfirmDialogProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isPending || disabled) return;
    onConfirm();
  };

  return (
    <Dialog onOpenChange={(next) => !next && onClose()} open={open}>
      <DialogContent className="bg-white">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-gray-600">{description}</div>
            </DialogDescription>
          </DialogHeader>

          {children}

          <DialogFooter>
            <CompactButton onClick={onClose} type="button" variant="outline">
              닫기
            </CompactButton>
            <CompactButton
              disabled={isPending || disabled}
              type="submit"
              variant={destructive ? "destructive" : "default"}
            >
              {isPending ? "처리 중…" : confirmLabel}
            </CompactButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
