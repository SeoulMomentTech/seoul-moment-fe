"use client";

import { useTranslations } from "next-intl";

import { useCopyToClipboard } from "@shared/lib/hooks";
import { toNTCurrency } from "@shared/lib/utils";
import type { UserOrderPayment } from "@shared/services/userOrder";
import {
  StatusInfo,
  StatusNotice,
  type StatusInfoRow,
} from "@shared/ui/status-card";

import { getBankName } from "../lib/bankName";
import { formatTaipeiDateTime } from "../lib/taipeiTime";

/** ATM 은 은행·가상계좌, 편의점은 납부 코드. 번호는 복사할 수 있고, 기한은 대만 시각으로 */
export function PaymentDepositInfo({ payment }: { payment: UserOrderPayment }) {
  const t = useTranslations();
  const info = payment.depositInfo;
  if (!info) return null;

  const isAtm = info.paymentType.startsWith("ATM_");
  const number = (isAtm ? info.account : info.paymentNo) ?? "";

  const rows: StatusInfoRow[] = [
    ...(isAtm
      ? [
          {
            label: "ATM 轉帳",
            value: `${getBankName(info.bankCode ?? "")} (${info.bankCode ?? ""})`,
          },
        ]
      : []),
    {
      label: isAtm ? t("payment_virtual_account") : t("payment_cvs_code_label"),
      value: <CopyableNumber value={number} />,
    },
    {
      label: t("payment_amount"),
      value: toNTCurrency(payment.amount),
      total: true,
    },
  ];

  return (
    <>
      <StatusInfo rows={rows} />
      {payment.expireAt && (
        <StatusNotice tone="warn">
          {t("payment_deadline", {
            date: formatTaipeiDateTime(payment.expireAt),
          })}
        </StatusNotice>
      )}
    </>
  );
}

function CopyableNumber({ value }: { value: string }) {
  const t = useTranslations();
  const { copy, copiedText } = useCopyToClipboard();
  const copied = copiedText === value;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-body-2 font-mono font-bold tracking-wide">
        {value}
      </span>
      <button
        className="text-body-5 shrink-0 rounded-[4px] border border-black/15 bg-white px-2 py-1 font-semibold"
        onClick={() => void copy(value)}
        type="button"
      >
        {t(copied ? "payment_copied" : "payment_copy")}
      </button>
    </span>
  );
}
