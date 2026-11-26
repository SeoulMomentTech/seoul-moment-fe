import { useState } from "react";

import {
  CompactButton,
  CompactInput,
  CompactTextarea,
} from "@shared/components/compact-form";
import type { GetAdminOrderDetailResponse } from "@shared/services/order";
import type { AdminRefund } from "@shared/services/refund";
import { EMPTY_VALUE, formatCurrency } from "@shared/utils/format";
import { toast } from "sonner";

import { Label } from "@seoul-moment/ui";

import {
  INVOICE_ADJUST_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  REFUND_REASON_MAX,
  REFUND_REFERENCE_MAX,
  REFUND_STATUS_BADGE_CLASS,
  REFUND_STATUS_LABEL,
} from "../constants";
import {
  useAdminOrderCancelWithdrawMutation,
  useAdminOrderInvoiceAdjustMutation,
  useAdminOrderRefundCancelMutation,
  useAdminOrderRefundCompleteMutation,
  useAdminOrderRefundMutation,
} from "../hooks";
import { OrderConfirmDialog } from "./OrderConfirmDialog";
import { Hint, Row, Section, StatusBadge } from "./OrderDetailParts";
import { getOrderActionErrorMessage } from "../lib/actionError";
import {
  canCancelRefund,
  canCompleteRefundManually,
  canRetryInvoiceAdjustment,
  canRunRefund,
  canWithdrawCancelRequest,
  isUnfinishedRefund,
} from "../lib/refund";
import { formatTaipeiDateTime } from "../lib/taipeiDate";

type RefundAction =
  | "refund"
  | "complete"
  | "cancelRefund"
  | "invoiceAdjust"
  | "withdraw";

/** 금액 입력칸. 숫자만 남긴다 */
const toDigits = (value: string) => value.replace(/\D/g, "");

interface OrderRefundTabProps {
  detail: GetAdminOrderDetailResponse;
}

/**
 * 취소·환불 탭. 환불(PG) 결과와 전자발표 정정 결과는 따로 보여준다 — 정정만 실패하면
 * 정정만 다시 누르고 환불은 다시 누르지 않는다. 환불 작업은 super_admin 만 된다.
 */
export function OrderRefundTab({ detail }: OrderRefundTabProps) {
  const { order, cancellation, refund, refunds, invoiceAdjustment } = detail;
  const orderId = order.orderId;

  const [action, setAction] = useState<RefundAction | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");

  const refundMutation = useAdminOrderRefundMutation();
  const completeMutation = useAdminOrderRefundCompleteMutation();
  const cancelRefundMutation = useAdminOrderRefundCancelMutation();
  const invoiceAdjustMutation = useAdminOrderInvoiceAdjustMutation();
  const withdrawMutation = useAdminOrderCancelWithdrawMutation();

  const isRetry = isUnfinishedRefund(refund);
  const amount = amountInput === "" ? null : Number(amountInput);
  const isAmountInvalid =
    amount !== null && (amount < 1 || amount > detail.refundableAmount);

  const close = () => setAction(null);

  const resetRefundForm = () => {
    setAmountInput("");
    setReason("");
  };

  const runRefund = () =>
    refundMutation.mutate(
      {
        orderId,
        // 재시도는 끝나지 않은 그 환불을 다시 보낸다. 금액·사유를 다시 보내지 않는다
        payload: isRetry
          ? {}
          : {
              amount: amount ?? undefined,
              reason: reason.trim() || undefined,
            },
      },
      {
        onSuccess: (response) => {
          const status = response.data.status;
          if (status === "COMPLETED") toast.success("환불을 완료했습니다.");
          else if (status === "FAILED")
            toast.error("PG 가 환불을 거절했습니다. 사유를 확인해주세요.");
          else if (status === "PROCESSING")
            toast.warning(
              "PG 결과를 아직 확인하지 못했습니다. 잠시 뒤 다시 시도해주세요.",
            );
          else if (response.data.isManual)
            toast.info(
              "수동 환불로 기록했습니다. 직접 돌려준 뒤 완료를 입력해주세요.",
            );
          else
            toast.info("환불을 보내지 못했습니다. 잠시 뒤 다시 시도해주세요.");
          resetRefundForm();
          close();
        },
        onError: (error) => {
          toast.error(
            getOrderActionErrorMessage(error, "환불을 실행하지 못했습니다.", {
              400: "환불 금액이 환불 가능 금액을 넘습니다.",
              409: "이미 전액 환불됐거나, 환불이 진행 중이거나, 환불할 수 없는 주문입니다.",
            }),
          );
          close();
        },
      },
    );

  const completeRefund = () =>
    completeMutation.mutate(
      { orderId, payload: { reference: reference.trim() } },
      {
        onSuccess: () => {
          toast.success("환불 완료를 기록했습니다.");
          setReference("");
          close();
        },
        onError: (error) => {
          toast.error(
            getOrderActionErrorMessage(
              error,
              "환불 완료를 기록하지 못했습니다.",
              {
                409: "완료를 입력할 수 있는 환불이 아닙니다. 결과 미확인 환불은 재시도로 결과부터 확인해주세요.",
              },
            ),
          );
          close();
        },
      },
    );

  const simpleAction = (
    mutate: (
      orderId: GetAdminOrderDetailResponse["order"]["orderId"],
      options: { onSuccess(): void; onError(error: unknown): void },
    ) => void,
    success: string,
    failure: string,
    conflict: string,
  ) =>
    mutate(orderId, {
      onSuccess: () => {
        toast.success(success);
        close();
      },
      onError: (error) => {
        toast.error(
          getOrderActionErrorMessage(error, failure, { 409: conflict }),
        );
        close();
      },
    });

  return (
    <div className="grid gap-5">
      <Section
        action={
          canWithdrawCancelRequest(detail) && (
            <CompactButton
              onClick={() => setAction("withdraw")}
              size="sm"
              variant="outline"
            >
              접수 철회
            </CompactButton>
          )
        }
        title="취소 접수"
      >
        {cancellation.requestedAt ? (
          <div className="grid gap-2">
            <dl className="grid gap-1.5 text-sm">
              <Row label="접수 시각">
                {formatTaipeiDateTime(cancellation.requestedAt)}
                {cancellation.withinQuickCancelPeriod && (
                  <span className="ml-1 text-xs text-gray-500">
                    (간편취소 구간)
                  </span>
                )}
              </Row>
              <Row label="사유">{cancellation.reason ?? EMPTY_VALUE}</Row>
            </dl>
            {isRetry && (
              <Hint>
                끝나지 않은 환불이 있어 철회할 수 없습니다. 철회하려면 아래에서
                환불 요청을 먼저 취소하세요.
              </Hint>
            )}
          </div>
        ) : (
          <Hint>
            접수된 취소가 없습니다. 고객 신청이 없어도(품절·판매 중단) 아래에서
            환불할 수 있습니다.
          </Hint>
        )}
      </Section>

      <Section title="환불">
        <dl className="grid gap-1.5 text-sm">
          <Row label="결제액">{formatCurrency(order.totalAmount)}</Row>
          <Row label="환불 완료 합계">
            {formatCurrency(detail.refundedAmount)}
          </Row>
          <Row label="환불 가능 금액" strong>
            {formatCurrency(detail.refundableAmount)}
          </Row>
        </dl>

        {refund && (
          <RefundCard
            onCancel={
              canCancelRefund(detail)
                ? () => setAction("cancelRefund")
                : undefined
            }
            onComplete={
              canCompleteRefundManually(detail)
                ? () => setAction("complete")
                : undefined
            }
            refund={refund}
          />
        )}

        {canRunRefund(detail) && (
          <div className="mt-3 grid gap-3 rounded-md border border-gray-200 p-3">
            {isRetry ? (
              <Hint>
                끝나지 않은 환불을 다시 보냅니다. 서버가 이미 나간 환불이 있는지
                먼저 확인하므로 두 번 돌려주지 않습니다.
              </Hint>
            ) : (
              <>
                <div className="grid gap-1.5">
                  <Label
                    className="text-xs text-gray-600"
                    htmlFor="refund-amount"
                  >
                    환불 금액 (비우면 전액 · 최대{" "}
                    {formatCurrency(detail.refundableAmount)})
                  </Label>
                  <CompactInput
                    aria-invalid={isAmountInvalid}
                    autoComplete="off"
                    id="refund-amount"
                    inputMode="numeric"
                    onChange={(event) =>
                      setAmountInput(toDigits(event.target.value))
                    }
                    placeholder={String(detail.refundableAmount)}
                    value={amountInput}
                  />
                  {isAmountInvalid && (
                    <p className="text-xs text-red-600">
                      1 이상, 환불 가능 금액 이하로 입력해주세요.
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label
                    className="text-xs text-gray-600"
                    htmlFor="refund-reason"
                  >
                    환불 사유
                  </Label>
                  <CompactTextarea
                    id="refund-reason"
                    maxLength={REFUND_REASON_MAX}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="예: 品項缺貨"
                    rows={2}
                    value={reason}
                  />
                </div>
              </>
            )}
            <div className="flex justify-end">
              <CompactButton
                disabled={isAmountInvalid}
                onClick={() => setAction("refund")}
                variant="destructive"
              >
                {isRetry ? "환불 재시도" : "환불 실행"}
              </CompactButton>
            </div>
          </div>
        )}

        {refunds.length > 1 && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-xs text-gray-500">
              환불 내역 {refunds.length}건
            </summary>
            <ul className="mt-2 grid gap-1.5">
              {refunds.map((item) => (
                <li className="flex justify-between gap-2" key={item.refundId}>
                  <span className="text-gray-500">
                    {formatTaipeiDateTime(item.requestedAt)}
                  </span>
                  <span className="tabular-nums">
                    {formatCurrency(item.amount)} ·{" "}
                    {REFUND_STATUS_LABEL[item.status]}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </Section>

      <Section
        action={
          canRetryInvoiceAdjustment(detail) && (
            <CompactButton
              onClick={() => setAction("invoiceAdjust")}
              size="sm"
              variant="outline"
            >
              발표 정정 재시도
            </CompactButton>
          )
        }
        title="전자발표 정정"
      >
        {invoiceAdjustment ? (
          <dl className="grid gap-1.5 text-sm">
            <Row label="발표번호">
              {invoiceAdjustment.invoiceNo ??
                (invoiceAdjustment.invoiceStatus === "ISSUED"
                  ? EMPTY_VALUE
                  : "未開立")}
            </Row>
            <Row label="정정 상태">
              {INVOICE_ADJUST_STATUS_LABEL[invoiceAdjustment.adjustStatus]}
            </Row>
            {invoiceAdjustment.allowanceNo && (
              <Row label="折讓單 번호">{invoiceAdjustment.allowanceNo}</Row>
            )}
            {invoiceAdjustment.adjustedAt && (
              <Row label="정정 시각">
                {formatTaipeiDateTime(invoiceAdjustment.adjustedAt)}
              </Row>
            )}
            {invoiceAdjustment.failureCode && (
              <Row label="실패 사유">
                {invoiceAdjustment.failureCode}
                {invoiceAdjustment.failureMessage &&
                  ` · ${invoiceAdjustment.failureMessage}`}
              </Row>
            )}
          </dl>
        ) : (
          <Hint>발표가 없는 주문입니다.</Hint>
        )}
      </Section>

      <Hint>
        환불 실행·완료 입력·요청 취소·발표 정정은 super_admin 관리자만 할 수
        있습니다.
      </Hint>

      <OrderConfirmDialog
        confirmLabel={isRetry ? "환불 재시도" : "환불 실행"}
        description={
          isRetry
            ? `${PAYMENT_METHOD_LABEL[order.paymentMethod]} 로 ${formatCurrency(refund?.amount ?? 0)} 환불을 다시 보냅니다.`
            : `${PAYMENT_METHOD_LABEL[order.paymentMethod]} 로 ${formatCurrency(amount ?? detail.refundableAmount)}${amount === null ? " (전액)" : ""} 를 돌려줍니다. ECPay ATM·편의점 결제는 기록만 되고 직접 돌려줘야 합니다.`
        }
        destructive
        isPending={refundMutation.isPending}
        onClose={close}
        onConfirm={runRefund}
        open={action === "refund"}
        title={isRetry ? "환불 재시도" : "환불 실행"}
      />

      <OrderConfirmDialog
        confirmLabel="완료 기록"
        description="이 작업은 돈을 보내지 않습니다. ECPay 後台이나 계좌 송금으로 실제로 돌려준 뒤에 기록하세요."
        disabled={reference.trim() === ""}
        isPending={completeMutation.isPending}
        onClose={close}
        onConfirm={completeRefund}
        open={action === "complete"}
        title="수동 환불 완료 입력"
      >
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
      </OrderConfirmDialog>

      <OrderConfirmDialog
        confirmLabel="환불 요청 취소"
        description="아직 돈이 나가지 않은 환불을 없던 일로 합니다. 고객이 취소를 거뒀거나 잘못 시작한 환불일 때만 쓰세요."
        destructive
        isPending={cancelRefundMutation.isPending}
        onClose={close}
        onConfirm={() =>
          simpleAction(
            cancelRefundMutation.mutate,
            "환불 요청을 취소했습니다.",
            "환불 요청을 취소하지 못했습니다.",
            "취소할 수 있는 환불이 없습니다. 결과 미확인 환불은 재시도로 결과부터 확인해주세요.",
          )
        }
        open={action === "cancelRefund"}
        title="환불 요청 취소"
      />

      <OrderConfirmDialog
        confirmLabel="정정 재시도"
        description="환불은 다시 하지 않고 전자발표 정정(作廢·折讓)만 다시 시도합니다."
        isPending={invoiceAdjustMutation.isPending}
        onClose={close}
        onConfirm={() =>
          simpleAction(
            invoiceAdjustMutation.mutate,
            "발표 정정을 다시 시도했습니다.",
            "발표 정정을 다시 시도하지 못했습니다.",
            "정정할 것이 없거나 발행·정정이 진행 중입니다.",
          )
        }
        open={action === "invoiceAdjust"}
        title="발표 정정 재시도"
      />

      <OrderConfirmDialog
        confirmLabel="접수 철회"
        description="고객이 취소 의사를 거둔 경우에만 쓰세요. 적법한 통지를 거절하는 용도가 아닙니다. 철회 사실과 원래 사유는 작업 이력에 남습니다."
        destructive
        isPending={withdrawMutation.isPending}
        onClose={close}
        onConfirm={() =>
          simpleAction(
            withdrawMutation.mutate,
            "취소 접수를 철회했습니다.",
            "취소 접수를 철회하지 못했습니다.",
            "접수된 취소가 없거나 끝나지 않은 환불이 있습니다.",
          )
        }
        open={action === "withdraw"}
        title="취소 접수 철회"
      />
    </div>
  );
}

function RefundCard({
  refund,
  onComplete,
  onCancel,
}: {
  refund: AdminRefund;
  onComplete?(): void;
  onCancel?(): void;
}) {
  return (
    <div className="mt-3 grid gap-2 rounded-md border border-gray-200 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-gray-900">가장 최근 환불</span>
        <StatusBadge className={REFUND_STATUS_BADGE_CLASS[refund.status]}>
          {REFUND_STATUS_LABEL[refund.status]}
        </StatusBadge>
        {refund.isManual && (
          <StatusBadge className="bg-gray-100 text-gray-700">수동</StatusBadge>
        )}
        {refund.adminId === null && (
          <StatusBadge className="bg-gray-100 text-gray-700">
            자동 환불
          </StatusBadge>
        )}
      </div>
      <dl className="grid gap-1 text-xs">
        <Row label="금액">{formatCurrency(refund.amount)}</Row>
        <Row label="요청 시각">{formatTaipeiDateTime(refund.requestedAt)}</Row>
        {refund.completedAt && (
          <Row label="완료 시각">
            {formatTaipeiDateTime(refund.completedAt)}
          </Row>
        )}
        <Row label="사유">{refund.reason ?? EMPTY_VALUE}</Row>
        <Row label="PG 요청 횟수">{refund.attemptCount}</Row>
        {refund.pgRefundId && <Row label="환불 번호">{refund.pgRefundId}</Row>}
        {refund.failureCode && (
          <Row label="실패 사유">
            {refund.failureCode}
            {refund.failureMessage && ` · ${refund.failureMessage}`}
          </Row>
        )}
      </dl>
      {refund.status === "PROCESSING" && (
        <Hint>
          PG 결과를 아직 확인하지 못했습니다. 마지막 요청 뒤 5분 동안은 조회만
          하니 잠시 뒤 재시도하세요.
        </Hint>
      )}
      {(onComplete || onCancel) && (
        <div className="flex justify-end gap-2">
          {onCancel && (
            <CompactButton onClick={onCancel} size="sm" variant="outline">
              환불 요청 취소
            </CompactButton>
          )}
          {onComplete && (
            <CompactButton onClick={onComplete} size="sm">
              환불 완료 입력
            </CompactButton>
          )}
        </div>
      )}
    </div>
  );
}
