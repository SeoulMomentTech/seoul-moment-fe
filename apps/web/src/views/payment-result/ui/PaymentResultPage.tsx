"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import { parseAsString, useQueryState } from "nuqs";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import { cn } from "@shared/lib/style";

import { userCartQueryKeys } from "@entities/cart";
import { usePaymentResultQuery } from "@entities/payment";
import { clearOrderDraft, clearPendingOrder } from "@features/order";
import { PaymentResultView, toPaymentResultState } from "@features/payment";
import { useQueryClient } from "@tanstack/react-query";

/** 이보다 오래 REQUESTED 면 "늦어지고 있어요" 로 문구를 바꾼다(폴링은 계속) */
const CHECKING_DELAY_MS = 60_000;

/**
 * `/payment/result?h={resultToken}`. PG 에서 돌아온 브라우저가 처음 보는 화면이라 로그인을
 * 요구하지 않는다 — LINE 안에서 외부 브라우저로 넘겨 결제하면 그 브라우저에는 세션이 없다.
 */
export function PaymentResultPage() {
  const t = useTranslations();
  const [token] = useQueryState("h", parseAsString);
  const query = usePaymentResultQuery(token);
  const queryClient = useQueryClient();
  const userId = useUserAuthStore((state) => state.id);

  const [delayed, setDelayed] = useState(false);
  useEffect(function markDelayed() {
    const timer = setTimeout(() => setDelayed(true), CHECKING_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const state = token
    ? toPaymentResultState(query, delayed)
    : ({ kind: "not-found" } as const);

  const isSettled = state.kind === "paid" || state.kind === "waiting";
  useEffect(
    function settle() {
      if (!isSettled) return;

      // 결제가 끝난 주문서 입력·기억은 더 쓸 일이 없다. 서버가 장바구니도 비웠다.
      clearPendingOrder();
      clearOrderDraft();
      if (userId)
        void queryClient.invalidateQueries({ queryKey: userCartQueryKeys.all });
    },
    [isSettled, userId, queryClient],
  );

  return (
    <div
      className={cn(
        "pt-30 mx-auto w-full max-w-7xl px-5 pb-20",
        "max-sm:pt-21 max-sm:px-4 max-sm:pb-12",
      )}
    >
      {/* 카드 제목이 상태를 말하므로 페이지 제목은 보조기술에만 둔다 */}
      <h1 className="sr-only">{t("payment_result_title")}</h1>
      <PaymentResultView state={state} />
    </div>
  );
}
