"use client";

import { useCallback, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { readErrorInfo } from "@shared/lib/utils/error";

import { useUserOrderPaymentMutation } from "@entities/order";

import { openPaymentTab, openPaymentWindow } from "./paymentWindow";

interface UseOrderRepayParams {
  orderId: number;
  /** 서버 상태가 바뀌었을 수 있을 때(409) — 주문을 다시 읽는다 */
  onChanged(): void;
}

/**
 * 주문 상세의 "다시 결제하기". 결제 전(PENDING) 주문에 결제 시작만 다시 부른다 — 서버가 이전
 * 시도를 닫는다. 결제창 위치는 주문서와 같다(데스크톱 새 탭, LINE 안 ECPay 는 외부 브라우저·LINE Pay 는
 * LINE 앱, 그 밖 같은 탭).
 * 새 탭·외부로 열었으면 `isAwaiting` 이 켜지고, 화면은 주문을 폴링해 결과를 반영한다.
 */
export const useOrderRepay = ({ orderId, onChanged }: UseOrderRepayParams) => {
  const t = useTranslations();
  const startPayment = useUserOrderPaymentMutation({ toastOnError: false });

  const busyRef = useRef(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [isAwaiting, setIsAwaiting] = useState(false);

  const repay = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsRepaying(true);

    // 데스크톱은 클릭과 같은 틱에 빈 탭을 연다(첫 await 전). 결제창이 거기 열리지 않으면 닫는다.
    const paymentTab = openPaymentTab(t("payment_opening_window"));
    let tabUsed = false;

    try {
      const { data: payment } = await startPayment.mutateAsync(orderId);
      const mode = await openPaymentWindow(payment, paymentTab);
      if (!mode) {
        toast.error(t("payment_start_failed"));

        return;
      }

      tabUsed = mode === "new-tab";
      if (mode !== "same-tab") setIsAwaiting(true);
    } catch (error) {
      const info = await readErrorInfo(error);

      if (info.status === 409) {
        toast.error(info.message ?? t("please_try_again"));
        onChanged();
      } else {
        toast.error(t("payment_start_failed"));
      }
    } finally {
      if (!tabUsed) paymentTab?.close();
      busyRef.current = false;
      setIsRepaying(false);
    }
  }, [orderId, onChanged, startPayment, t]);

  return { repay, isRepaying, isAwaiting };
};
