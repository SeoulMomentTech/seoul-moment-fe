import { useEffect, useState } from "react";

import {
  OrderConfirmDialog,
  OrderDrawer,
  OrderPurchaseDialog,
} from "@pages/OrderPage/components";
import {
  PAYMENT_METHOD_LABEL,
  REFUND_REFERENCE_MAX,
} from "@pages/OrderPage/constants";
import {
  useAdminOrderInvoiceAdjustMutation,
  useAdminOrderRefundCompleteMutation,
  useAdminOrderRefundMutation,
} from "@pages/OrderPage/hooks";
import { getOrderActionErrorMessage } from "@pages/OrderPage/lib/actionError";
import { CompactInput } from "@shared/components/compact-form";
import { PageHeader } from "@shared/components/page-header";
import { PageSizeSelect } from "@shared/components/page-size-select";
import { Pagination } from "@shared/components/pagination";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@shared/constants/page";
import type { AdminOrderId, AdminOrderListItem } from "@shared/services/order";
import type {
  AdminRefundListItem,
  AdminRefundStatus,
} from "@shared/services/refund";
import { formatCurrency } from "@shared/utils/format";
import { toast } from "sonner";

import { Label, cn } from "@seoul-moment/ui";

import { RefundTable } from "./components/RefundTable";
import { useAdminRefundListQuery } from "./hooks";
import type { RefundRowAction } from "./lib/rowAction";

type RefundChip = AdminRefundStatus | "ALL";

const REFUND_CHIPS: { value: RefundChip; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "REQUESTED", label: "환불 요청" },
  { value: "PROCESSING", label: "결과 미확인" },
  { value: "COMPLETED", label: "완료" },
  { value: "FAILED", label: "실패" },
];

/** 드로어의 24시간 카드는 분 단위라 30초마다 다시 그리면 충분하다 */
const COUNTDOWN_TICK_MS = 30_000;

const useNow = (intervalMs: number) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
};

interface PendingAction {
  refund: AdminRefundListItem;
  action: RefundRowAction;
}

/**
 * 취소/환불 내역. 시작된 환불을 최근순으로 모아 본다(자동 환불 포함 · 부분 환불은 건마다 한 줄).
 * 환불(PG) 결과와 전자발표 정정 결과가 따로 오니 둘이 어긋난 건을 여기서 찾는다.
 */
export function RefundListPage() {
  const [chip, setChip] = useState<RefundChip>("ALL");
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [detailOrderId, setDetailOrderId] = useState<AdminOrderId | null>(null);
  const [purchaseTarget, setPurchaseTarget] =
    useState<AdminOrderListItem | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [reference, setReference] = useState("");

  const now = useNow(COUNTDOWN_TICK_MS);

  const { data, isLoading, isFetching } = useAdminRefundListQuery({
    page,
    count: pageSize,
    status: chip === "ALL" ? undefined : chip,
  });
  const refunds = data?.data.list ?? [];
  const totalItems = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const refundMutation = useAdminOrderRefundMutation();
  const completeMutation = useAdminOrderRefundCompleteMutation();
  const invoiceAdjustMutation = useAdminOrderInvoiceAdjustMutation();

  const closeAction = () => {
    setPending(null);
    setReference("");
  };

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  const runAction = () => {
    if (!pending) return;
    const { orderId } = pending.refund;

    if (pending.action === "complete") {
      completeMutation.mutate(
        { orderId, payload: { reference: reference.trim() } },
        {
          onSuccess: () => {
            toast.success("환불 완료를 기록했습니다.");
            closeAction();
          },
          onError: (error) => {
            toast.error(
              getOrderActionErrorMessage(
                error,
                "환불 완료를 기록하지 못했습니다.",
                { 409: "완료를 입력할 수 있는 환불이 아닙니다." },
              ),
            );
            closeAction();
          },
        },
      );
      return;
    }

    if (pending.action === "retry") {
      // 재시도는 끝나지 않은 그 환불을 다시 보낸다. 금액·사유를 다시 보내지 않는다
      refundMutation.mutate(
        { orderId, payload: {} },
        {
          onSuccess: (response) => {
            const { status } = response.data;
            if (status === "COMPLETED") toast.success("환불을 완료했습니다.");
            else if (status === "FAILED")
              toast.error("PG 가 환불을 거절했습니다. 사유를 확인해주세요.");
            else
              toast.warning(
                "PG 결과를 아직 확인하지 못했습니다. 잠시 뒤 다시 시도해주세요.",
              );
            closeAction();
          },
          onError: (error) => {
            toast.error(
              getOrderActionErrorMessage(
                error,
                "환불을 다시 보내지 못했습니다.",
                {
                  409: "같은 주문의 환불이 진행 중이거나 이미 끝났습니다.",
                },
              ),
            );
            closeAction();
          },
        },
      );
      return;
    }

    invoiceAdjustMutation.mutate(orderId, {
      onSuccess: () => {
        toast.success("발표 정정을 다시 시도했습니다.");
        closeAction();
      },
      onError: (error) => {
        toast.error(
          getOrderActionErrorMessage(
            error,
            "발표 정정을 다시 시도하지 못했습니다.",
            { 409: "정정할 것이 없거나 발행·정정이 진행 중입니다." },
          ),
        );
        closeAction();
      },
    });
  };

  const isActionPending =
    refundMutation.isPending ||
    completeMutation.isPending ||
    invoiceAdjustMutation.isPending;

  const target = pending?.refund;
  const dialogCopy: Record<
    RefundRowAction,
    { title: string; description: string; confirmLabel: string }
  > = {
    complete: {
      title: "수동 환불 완료 입력",
      description:
        "이 작업은 돈을 보내지 않습니다. ECPay 後台이나 계좌 송금으로 실제로 돌려준 뒤에 기록하세요.",
      confirmLabel: "완료 기록",
    },
    retry: {
      title: "환불 재시도",
      description: target
        ? `${target.orderNumber ?? `#${target.orderId}`} · ${PAYMENT_METHOD_LABEL[target.method]} 로 ${formatCurrency(target.amount)} 환불을 다시 보냅니다. 서버가 이미 나간 환불이 있는지 먼저 확인합니다.`
        : "",
      confirmLabel: "환불 재시도",
    },
    invoiceAdjust: {
      title: "발표 정정 재시도",
      description:
        "환불은 다시 하지 않고 전자발표 정정(作廢·折讓)만 다시 시도합니다.",
      confirmLabel: "정정 재시도",
    },
  };
  const copy = pending ? dialogCopy[pending.action] : null;

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="시작된 환불(자동 환불 포함)을 모아 봅니다. 환불 결과와 전자발표 정정 결과가 어긋난 건을 여기서 처리합니다."
        title="취소/환불 내역"
      />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex flex-wrap gap-1.5" role="group">
            {REFUND_CHIPS.map((item) => (
              <button
                aria-pressed={chip === item.value}
                className={cn(
                  "duration-normal h-8 rounded-full border px-3 text-sm transition-colors",
                  chip === item.value
                    ? "border-gray-900 bg-gray-900 font-medium text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:text-gray-900",
                )}
                key={item.value}
                onClick={() => {
                  setChip(item.value);
                  setPage(DEFAULT_PAGE);
                }}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <PageSizeSelect
              onChange={(size) => {
                setPageSize(size);
                setPage(DEFAULT_PAGE);
              }}
              value={pageSize}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <RefundTable
            hasActiveFilters={chip !== "ALL"}
            isFetching={isFetching}
            isLoading={isLoading}
            onAction={(refund, action) => setPending({ refund, action })}
            onOpenDetail={(refund) => setDetailOrderId(refund.orderId)}
            refunds={refunds}
            selectedOrderId={detailOrderId}
          />
        </div>

        <div className="border-t border-gray-200 p-4">
          <Pagination
            countOnPage={refunds.length}
            disableNext={isFetching || page >= totalPages || totalItems === 0}
            disablePrev={isFetching || page <= 1}
            onNext={() => handlePageChange(page + 1)}
            onPrev={() => handlePageChange(page - 1)}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        환불 실행·완료 입력·정정은 super_admin 관리자만 할 수 있습니다. 수동
        환불은 실제로 돌려줬는지 확인한 뒤에 완료를 입력하세요.
      </p>

      <OrderConfirmDialog
        confirmLabel={copy?.confirmLabel ?? ""}
        description={copy?.description ?? ""}
        destructive={pending?.action === "retry"}
        disabled={pending?.action === "complete" && reference.trim() === ""}
        isPending={isActionPending}
        onClose={closeAction}
        onConfirm={runAction}
        open={pending !== null}
        title={copy?.title ?? ""}
      >
        {pending?.action === "complete" && (
          <div className="grid gap-1.5">
            <Label className="text-xs text-gray-600" htmlFor="refund-reference">
              돌려준 근거 (필수)
            </Label>
            <CompactInput
              autoComplete="off"
              id="refund-reference"
              maxLength={REFUND_REFERENCE_MAX}
              onChange={(event) => setReference(event.target.value)}
              placeholder="ECPay 退刷 처리번호, 송금 참조번호 등"
              value={reference}
            />
          </div>
        )}
      </OrderConfirmDialog>

      <OrderDrawer
        initialTab="refund"
        now={now}
        onClose={() => setDetailOrderId(null)}
        onStartPurchase={setPurchaseTarget}
        orderId={detailOrderId}
      />

      <OrderPurchaseDialog
        onClose={() => setPurchaseTarget(null)}
        order={purchaseTarget}
      />
    </div>
  );
}
