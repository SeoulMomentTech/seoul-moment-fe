"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { readErrorInfo, type ErrorInfo } from "@shared/lib/utils/error";
import type {
  PostUserOrderPreviewRes,
  UserOrderPaymentMethod,
} from "@shared/services/userOrder";

import {
  toOrderHref,
  toOrderSourceBody,
  useCreateUserOrderMutation,
  useUserOrderPaymentMutation,
  type CreateUserOrderVariables,
  type OrderSource,
} from "@entities/order";

import { clearOrderDraft } from "./orderDraft";
import { openPaymentTab, openPaymentWindow } from "./paymentWindow";
import {
  clearPendingOrder,
  findPendingOrder,
  savePendingOrder,
  toPendingBodyKey,
  updatePendingOrder,
} from "./pendingOrder";
import type { useOrderInvoice } from "./useOrderInvoice";
import type { OrderSubmitShipping } from "./useOrderShipping";

/** 결제창을 다른 곳(외부 브라우저·새 탭)에 연 뒤, 이 화면이 결과를 기다리는 데 필요한 것 */
export interface ExternalPayment {
  /** 어디에 열었는지 — 대기 화면의 문구가 다르다 */
  mode: "external" | "new-tab";
  orderId: number;
  orderNumber: string;
  /** 이번 시도. 주문 상세의 payment.paymentId 와 맞춰 "이번 시도가 실패했다" 를 가린다 */
  paymentId: number;
  /** 결과 페이지(`/payment/result?h=`)의 열쇠 */
  resultToken: string;
}

/** 결제 시작 409 — 재고가 모자란 SKU */
export interface StockShortage {
  productVariantIds: number[];
}

/** 주문 생성 400 의 data.field 중 전자발표 칸으로 가는 것 */
const INVOICE_FIELDS = new Set(["carrierNum", "loveCode", "companyTaxId"]);

const isStoreExpiredError = (info: ErrorInfo) =>
  info.data?.field === "storeToken" ||
  (!info.data?.field && /store|token|매장/i.test(info.message ?? ""));

interface UseOrderSubmitParams {
  source: OrderSource | null;
  preview: PostUserOrderPreviewRes | undefined;
  paymentMethod: UserOrderPaymentMethod;
  submitShipping: OrderSubmitShipping | null;
  invoice: Pick<
    ReturnType<typeof useOrderInvoice>,
    "ensureChecked" | "applyServerFieldError"
  >;
  /** 주문 생성이 매장 토큰 만료(400)를 돌려줬을 때 */
  onStoreExpired(): void;
  /** 주문 생성 409(구매 불가 라인) — 미리보기를 다시 받아 화면을 맞춘다 */
  onPreviewStale(): void;
  /**
   * 제출 직전 최신 미리보기. 화면의 미리보기는 캐시(keepPreviousData)일 수 있어 — 장바구니
   * 수량을 고치고 돌아온 직후·bfcache 복귀 — 그것으로 키를 만들면 옛 금액의 주문을 재사용한다.
   */
  getFreshPreview(): Promise<PostUserOrderPreviewRes | undefined>;
}

/**
 * 결제하기 한 번 = 전자발표 확인 → 주문 생성(필요할 때만) → 결제 시작 → 결제창.
 *
 * 주문 생성은 같은 주문서·같은 입력(미리보기 스냅샷 포함)에 대해 한 번만 나간다 —
 * 결제창에서 이탈해 돌아와 다시 누르면 기억한 주문으로 결제 시작만 다시 부른다(서버가
 * 이전 시도를 닫는다). 연타는 ref 로 막는다: state 만으로는 같은 틱의 두 번째 클릭을
 * 못 거른다.
 */
export const useOrderSubmit = ({
  source,
  preview,
  paymentMethod,
  submitShipping,
  invoice,
  onStoreExpired,
  onPreviewStale,
  getFreshPreview,
}: UseOrderSubmitParams) => {
  const t = useTranslations();
  const createOrder = useCreateUserOrderMutation({ toastOnError: false });
  const startPayment = useUserOrderPaymentMutation({ toastOnError: false });

  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [stockShortage, setStockShortage] = useState<StockShortage | null>(
    null,
  );
  const [external, setExternal] = useState<ExternalPayment | null>(null);

  const fallbackMessage = (info: ErrorInfo) =>
    info.message ?? t("please_try_again");

  /** 결제 시작 → 결제창. 실패는 던진다(호출부가 분기) */
  const startAndOpen = useCallback(
    async (
      order: { orderId: number; orderNumber: string },
      paymentTab: Window | null,
    ) => {
      const { data: payment } = await startPayment.mutateAsync(order.orderId);

      updatePendingOrder({ resultToken: payment.resultToken });
      // 결제창으로 떠나면 지도 왕복용 입력 보관은 더 쓸 일이 없다
      clearOrderDraft();

      if (!payment.handoffUrl) {
        toast.error(t("payment_start_failed"));

        return null;
      }

      const mode = await openPaymentWindow(payment.handoffUrl, paymentTab);
      if (mode !== "same-tab") {
        setExternal({
          mode,
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          paymentId: payment.paymentId,
          resultToken: payment.resultToken,
        });
      }

      return mode;
    },
    [startPayment, t],
  );

  const handleCreateError = useCallback(
    async (error: unknown) => {
      const info = await readErrorInfo(error);

      if (info.status === 400) {
        const field = info.data?.field;
        if (field && INVOICE_FIELDS.has(field)) {
          invoice.applyServerFieldError(field as "carrierNum");

          return;
        }
        if (isStoreExpiredError(info)) {
          onStoreExpired();

          return;
        }
      }

      toast.error(fallbackMessage(info));
      if (info.status === 409) onPreviewStale();
    },
    // fallbackMessage 는 t 에만 의존한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invoice, onStoreExpired, onPreviewStale, t],
  );

  const handleStartError = useCallback(
    async (error: unknown) => {
      const info = await readErrorInfo(error);

      if (info.status === 409) {
        // 어느 쪽이든 이 주문으로는 더 못 간다 — 다음 클릭은 새 주문
        clearPendingOrder();

        const variantIds = info.data?.productVariantIds;
        if (variantIds?.length) {
          setStockShortage({ productVariantIds: variantIds });

          return;
        }

        toast.error(fallbackMessage(info));

        return;
      }

      // 5xx·네트워크: 서버가 잡았던 재고를 돌려놨으니 같은 주문으로 다시 시작하면 된다
      if (!info.isHttp || (info.status ?? 500) >= 500) {
        toast.error(t("payment_start_failed"));

        return;
      }

      toast.error(fallbackMessage(info));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    if (!source || !preview || !submitShipping) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setStockShortage(null);

    // 같은 탭으로 떠나는 중이면 가드를 풀지 않는다 — 풀면 페이지가 바뀌기 전 두 번째 탭이
    // 결제 시작을 다시 불러, 서버가 지금 열리는 결제창의 시도를 닫아 버린다
    let leaving = false;
    // 데스크톱은 클릭과 같은 틱에 빈 탭을 연다(첫 await 전). 결제창이 거기 열리지 않으면 닫는다.
    const paymentTab = openPaymentTab(t("payment_opening_window"));
    let tabUsed = false;

    try {
      const checked = await invoice.ensureChecked();
      if (!checked.ok) return;

      const snapshot =
        (await getFreshPreview().catch(() => undefined)) ?? preview;

      const body = {
        ...toOrderSourceBody(source),
        paymentMethod,
        ...submitShipping,
        ...(checked.invoice && { invoice: checked.invoice }),
      } as CreateUserOrderVariables;
      const sourceHref = toOrderHref(source);
      const bodyKey = toPendingBodyKey(body, snapshot);

      let order = findPendingOrder(sourceHref, bodyKey);

      if (!order) {
        let created;
        try {
          created = (await createOrder.mutateAsync(body)).data;
        } catch (error) {
          await handleCreateError(error);

          return;
        }

        savePendingOrder({
          sourceHref,
          bodyKey,
          orderId: created.orderId,
          orderNumber: created.orderNumber,
          totalAmount: created.totalAmount,
        });
        order = {
          sourceHref,
          bodyKey,
          orderId: created.orderId,
          orderNumber: created.orderNumber,
          totalAmount: created.totalAmount,
          savedAt: Date.now(),
        };
      }

      try {
        const mode = await startAndOpen(order, paymentTab);
        leaving = mode === "same-tab";
        tabUsed = mode === "new-tab";
      } catch (error) {
        await handleStartError(error);
      }
    } finally {
      if (!tabUsed) paymentTab?.close();
      if (!leaving) {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    }
  }, [
    source,
    preview,
    submitShipping,
    paymentMethod,
    invoice,
    createOrder,
    startAndOpen,
    handleCreateError,
    handleStartError,
    getFreshPreview,
    t,
  ]);

  // 결제창에서 뒤로 오면 bfcache 가 "처리 중" 상태 그대로 페이지를 되살린다. 그때만 가드를 푼다.
  useEffect(function releaseOnBfcacheRestore() {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;

      submittingRef.current = false;
      setIsSubmitting(false);
    };
    window.addEventListener("pageshow", onPageShow);

    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  /**
   * 대기 화면의 "다시 결제하기". 결제 시작만 다시 부른다. 409(이미 결제됨 — 폴링 지연)는
   * 조용히 끝내고 호출부가 주문 상세를 즉시 다시 읽는다.
   */
  const retryPayment = useCallback(async () => {
    if (!external || isRetrying) return;

    const paymentTab = openPaymentTab(t("payment_opening_window"));
    let tabUsed = false;

    setIsRetrying(true);
    try {
      tabUsed = (await startAndOpen(external, paymentTab)) === "new-tab";
    } catch (error) {
      const info = await readErrorInfo(error);
      if (info.status !== 409) await handleStartError(error);
    } finally {
      if (!tabUsed) paymentTab?.close();
      setIsRetrying(false);
    }
  }, [external, isRetrying, startAndOpen, handleStartError, t]);

  return {
    submit,
    isSubmitting,
    stockShortage,
    external,
    retryPayment,
    isRetrying,
  };
};
