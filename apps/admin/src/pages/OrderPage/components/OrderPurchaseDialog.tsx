import { useState, type FormEvent } from "react";

import {
  CompactButton,
  CompactInput,
  CompactTextarea,
} from "@shared/components/compact-form";
import type { AdminOrderListItem } from "@shared/services/order";
import { formatCurrency } from "@shared/utils/format";
import axios from "axios";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from "@seoul-moment/ui";

import { EARLY_REASON_MAX, SUPPLIER_ORDER_NO_MAX } from "../constants";
import { useAdminOrderPurchaseMutation } from "../hooks";
import { isEarlyPurchase } from "../lib/purchase";

const getPurchaseErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) {
      return "이미 발주됐거나 취소가 접수된 주문입니다. 최신 상태로 다시 불러왔습니다.";
    }
    if (error.response?.status === 400) {
      return "입력값을 확인해주세요. 24시간 전 발주는 사유가 필요합니다.";
    }
  }
  return "발주를 시작하지 못했습니다. 잠시 후 다시 시도해주세요.";
};

interface OrderPurchaseDialogProps {
  /** 발주할 주문. null 이면 닫힌다 */
  order: AdminOrderListItem | null;
  onClose(): void;
}

/**
 * 한국 발주 확인 모달. 오발주를 막으려고 버튼을 바로 실행하지 않고 한 번 거친다.
 * 공급처에 자동 주문이 나가지 않으므로 발주번호는 관리자가 적는다.
 */
export function OrderPurchaseDialog({
  order,
  onClose,
}: OrderPurchaseDialogProps) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={order !== null}>
      <DialogContent className="bg-white">
        {/* 주문이 바뀔 때마다 입력칸을 비운다 */}
        {order && (
          <PurchaseForm key={order.orderId} onClose={onClose} order={order} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PurchaseForm({
  order,
  onClose,
}: {
  order: AdminOrderListItem;
  onClose(): void;
}) {
  const [supplierOrderNo, setSupplierOrderNo] = useState("");
  const [earlyReason, setEarlyReason] = useState("");
  const { mutate, isPending } = useAdminOrderPurchaseMutation();

  const isEarly = isEarlyPurchase(order);
  const canSubmit = !isPending && (!isEarly || earlyReason.trim().length > 0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    mutate(
      {
        orderId: order.orderId,
        payload: {
          supplierOrderNo: supplierOrderNo.trim() || undefined,
          earlyReason: isEarly ? earlyReason.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(`${order.orderNumber} 발주를 시작했습니다.`);
          onClose();
        },
        onError: (error) => {
          toast.error(getPurchaseErrorMessage(error));
          onClose();
        },
      },
    );
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEarly ? "조기 발주" : "한국 발주 시작"}</DialogTitle>
        <DialogDescription>
          {order.orderNumber} · {order.recipientName ?? "받는 분 없음"} ·{" "}
          {formatCurrency(order.totalAmount)}
        </DialogDescription>
      </DialogHeader>

      {isEarly && (
        <p className="rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-800">
          아직 결제 후 24시간이 지나지 않았습니다. 사유가 주문에 기록됩니다.
        </p>
      )}

      <div className="grid gap-1.5">
        <Label className="text-xs text-gray-600" htmlFor="supplier-order-no">
          공급처 발주번호 (선택)
        </Label>
        <CompactInput
          autoComplete="off"
          id="supplier-order-no"
          maxLength={SUPPLIER_ORDER_NO_MAX}
          onChange={(event) => setSupplierOrderNo(event.target.value)}
          placeholder="KR-20261123-0042"
          value={supplierOrderNo}
        />
      </div>

      {isEarly && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-gray-600" htmlFor="early-reason">
            조기 발주 사유 (필수)
          </Label>
          <CompactTextarea
            id="early-reason"
            maxLength={EARLY_REASON_MAX}
            onChange={(event) => setEarlyReason(event.target.value)}
            placeholder="예: 재고 소진 임박"
            rows={3}
            value={earlyReason}
          />
        </div>
      )}

      <p className="text-xs text-gray-500">
        공급처에 주문이 자동으로 나가지 않습니다. 발주 후 배송 단계가 ‘상품 준비
        중’으로 바뀝니다.
      </p>

      <DialogFooter>
        <CompactButton onClick={onClose} type="button" variant="outline">
          취소
        </CompactButton>
        <CompactButton disabled={!canSubmit} type="submit">
          {isPending ? "처리 중…" : isEarly ? "조기 발주" : "발주 시작"}
        </CompactButton>
      </DialogFooter>
    </form>
  );
}
