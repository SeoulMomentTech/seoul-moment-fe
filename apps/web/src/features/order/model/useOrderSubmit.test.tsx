import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as UserOrderService from "@shared/services/userOrder";
import type { PostUserOrderPreviewRes } from "@shared/services/userOrder";

import type { OrderSource } from "@entities/order";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { ORDER_DRAFT_KEY } from "./orderDraft";
import {
  findPendingOrder,
  savePendingOrder,
  toPendingBodyKey,
} from "./pendingOrder";
import { useOrderSubmit } from "./useOrderSubmit";

const createUserOrder = vi.fn();
const postUserOrderPayment = vi.fn();
vi.mock("@shared/services/userOrder", async (importOriginal) => ({
  ...(await importOriginal<typeof UserOrderService>()),
  createUserOrder: (req: unknown) => createUserOrder(req),
  postUserOrderPayment: (req: unknown) => postUserOrderPayment(req),
}));

const openPaymentWindow = vi.fn();
const openPaymentTab = vi.fn();
vi.mock("./paymentWindow", () => ({
  openPaymentWindow: (url: string, tab?: unknown) =>
    openPaymentWindow(url, tab),
  openPaymentTab: (text: string) => openPaymentTab(text),
}));

const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { error: (message: string) => toastError(message) },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "ko" }),
}));

vi.mock("@/i18n/navigation", () => ({
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    `/${locale}${href}`,
}));

/** ky 의 isHTTPError 는 name 폴백이 있어 실제 Request 없이 같은 분기를 탄다 */
const httpError = (status: number, body: object) => {
  const error = new Error(`Request failed with status code ${status}`);
  error.name = "HTTPError";

  return Object.assign(error, {
    response: new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  });
};

const source: OrderSource = { type: "cart", cartItemIds: [12] };

const preview = {
  brandGroups: [
    {
      brandId: 1,
      brandName: "b",
      items: [
        {
          cartItemId: 12,
          productItemId: 7,
          productVariantId: 101,
          productName: "크롭 후드 집업",
          optionText: "베이지 / FREE",
          imageUrl: "",
          price: 1100,
          quantity: 1,
          totalPrice: 1100,
          stockQuantity: 3,
          isSoldOut: false,
          isAvailable: true,
        },
      ],
    },
  ],
  totalProductAmount: 1100,
  shippingFee: 60,
  isRemoteIsland: false,
  isShippingEstimated: false,
  freeShippingThreshold: 1150,
  amountToFreeShipping: 50,
  totalAmount: 1160,
} as unknown as PostUserOrderPreviewRes;

const createdOrder = {
  result: true,
  data: { orderId: 481, orderNumber: "SM-20261104-000481", totalAmount: 1160 },
};

const startedPayment = {
  result: true,
  data: {
    paymentId: 12,
    method: "ECPAY",
    handoffUrl: "https://api-dev.test/payment/ecpay/handoff/Xy9",
    paymentUrl: null,
    appUrl: null,
    resultToken: "Xy9",
  },
};

const messages = {
  payment_start_failed: "결제를 시작할 수 없어요",
  payment_opening_window: "결제창을 여는 중…",
  please_try_again: "다시 시도해주세요",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })
    }
  >
    <NextIntlClientProvider locale="ko" messages={messages}>
      {children}
    </NextIntlClientProvider>
  </QueryClientProvider>
);

type Params = Parameters<typeof useOrderSubmit>[0];

const ensureChecked = vi.fn();
const applyServerFieldError = vi.fn();
const onStoreExpired = vi.fn();
const onPreviewStale = vi.fn();
const getFreshPreview = vi.fn();

const baseParams = (): Params => ({
  source,
  preview,
  paymentMethod: "ECPAY",
  submitShipping: { shippingType: "HOME", useDefaultShipping: true },
  invoice: { ensureChecked, applyServerFieldError },
  onStoreExpired,
  onPreviewStale,
  getFreshPreview,
});

const render = (params: Params = baseParams()) =>
  renderHook(() => useOrderSubmit(params), { wrapper });

describe("useOrderSubmit", () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ORDER_DRAFT_KEY, "{}");
    ensureChecked.mockResolvedValue({ ok: true, invoice: undefined });
    createUserOrder.mockResolvedValue(createdOrder);
    postUserOrderPayment.mockResolvedValue(startedPayment);
    openPaymentWindow.mockResolvedValue("same-tab");
    getFreshPreview.mockResolvedValue(preview);
    openPaymentTab.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("생성 → 시작 → 결제창 순서로 부르고 draft 를 지운다", async () => {
    const { result } = render();

    await act(() => result.current.submit());

    expect(createUserOrder).toHaveBeenCalledTimes(1);
    expect(createUserOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        cartItemIds: [12],
        paymentMethod: "ECPAY",
        shippingType: "HOME",
        useDefaultShipping: true,
        languageCode: "ko",
      }),
    );
    expect(createUserOrder.mock.calls[0][0]).not.toHaveProperty("invoice");
    expect(postUserOrderPayment).toHaveBeenCalledWith({
      orderId: 481,
      languageCode: "ko",
    });
    expect(openPaymentWindow).toHaveBeenCalledWith(
      startedPayment.data.handoffUrl,
      null,
    );
    expect(sessionStorage.getItem(ORDER_DRAFT_KEY)).toBeNull();
    expect(result.current.external).toBeNull();
  });

  it("전자발표 값이 있으면 body 에 invoice 로 싣는다", async () => {
    ensureChecked.mockResolvedValue({
      ok: true,
      invoice: { type: "DONATION", loveCode: "168001" },
    });
    const { result } = render();

    await act(() => result.current.submit());

    expect(createUserOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice: { type: "DONATION", loveCode: "168001" },
      }),
    );
  });

  it("ensureChecked 가 ok:false 면 아무것도 부르지 않는다", async () => {
    ensureChecked.mockResolvedValue({ ok: false });
    const { result } = render();

    await act(() => result.current.submit());

    expect(createUserOrder).not.toHaveBeenCalled();
    expect(postUserOrderPayment).not.toHaveBeenCalled();
  });

  it("연타해도 주문 생성은 한 번이다", async () => {
    const { result } = render();

    await act(async () => {
      void result.current.submit();
      void result.current.submit();
    });

    expect(createUserOrder).toHaveBeenCalledTimes(1);
    expect(postUserOrderPayment).toHaveBeenCalledTimes(1);
  });

  it("같은 입력의 주문이 기억돼 있으면 생성을 건너뛴다", async () => {
    const body = {
      cartItemIds: [12],
      paymentMethod: "ECPAY" as const,
      shippingType: "HOME" as const,
      useDefaultShipping: true as const,
    };
    savePendingOrder({
      sourceHref: "/order?cart=12",
      bodyKey: toPendingBodyKey(body, preview),
      orderId: 480,
      orderNumber: "SM-0480",
      totalAmount: 1160,
    });
    const { result } = render();

    await act(() => result.current.submit());

    expect(createUserOrder).not.toHaveBeenCalled();
    expect(postUserOrderPayment).toHaveBeenCalledWith({
      orderId: 480,
      languageCode: "ko",
    });
  });

  it("미리보기 수량이 달라지면 새 주문을 만든다", async () => {
    const body = {
      cartItemIds: [12],
      paymentMethod: "ECPAY" as const,
      shippingType: "HOME" as const,
      useDefaultShipping: true as const,
    };
    savePendingOrder({
      sourceHref: "/order?cart=12",
      bodyKey: toPendingBodyKey(body, { ...preview, totalAmount: 2260 }),
      orderId: 480,
      orderNumber: "SM-0480",
      totalAmount: 2260,
    });
    const { result } = render();

    await act(() => result.current.submit());

    expect(createUserOrder).toHaveBeenCalledTimes(1);
    expect(postUserOrderPayment).toHaveBeenCalledWith({
      orderId: 481,
      languageCode: "ko",
    });
  });

  it("생성 400 data.field=carrierNum 이면 applyServerFieldError 를 부르고 멈춘다", async () => {
    createUserOrder.mockRejectedValue(
      httpError(400, { message: "invalid", data: { field: "carrierNum" } }),
    );
    const { result } = render();

    await act(() => result.current.submit());

    expect(applyServerFieldError).toHaveBeenCalledWith("carrierNum");
    expect(postUserOrderPayment).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("생성 400 data.field=storeToken 이면 onStoreExpired", async () => {
    createUserOrder.mockRejectedValue(
      httpError(400, {
        message: "store expired",
        data: { field: "storeToken" },
      }),
    );
    const { result } = render();

    await act(() => result.current.submit());

    expect(onStoreExpired).toHaveBeenCalledTimes(1);
    expect(postUserOrderPayment).not.toHaveBeenCalled();
  });

  it("생성 409 는 토스트하고 미리보기를 다시 부른다", async () => {
    createUserOrder.mockRejectedValue(
      httpError(409, { message: "line unavailable", code: "CONFLICT" }),
    );
    const { result } = render();

    await act(() => result.current.submit());

    expect(toastError).toHaveBeenCalledWith("line unavailable");
    expect(onPreviewStale).toHaveBeenCalledTimes(1);
  });

  it("시작 409 productVariantIds 면 stockShortage 를 두고 기억을 지운다", async () => {
    postUserOrderPayment.mockRejectedValue(
      httpError(409, {
        message: "Some items are out of stock",
        code: "CONFLICT",
        data: { productVariantIds: [101] },
      }),
    );
    const { result } = render();

    await act(() => result.current.submit());

    expect(result.current.stockShortage).toEqual({ productVariantIds: [101] });
    expect(
      findPendingOrder("/order?cart=12", expect.any(String) as string),
    ).toBeNull();
    expect(sessionStorage.getItem("order:pending")).toBeNull();
    expect(openPaymentWindow).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });

  it("시작 409 그 밖은 기억을 지우고 토스트한다", async () => {
    postUserOrderPayment.mockRejectedValue(
      httpError(409, { message: "already paid", code: "CONFLICT" }),
    );
    const { result } = render();

    await act(() => result.current.submit());

    expect(sessionStorage.getItem("order:pending")).toBeNull();
    expect(toastError).toHaveBeenCalledWith("already paid");
  });

  it("시작 500 이면 토스트하고 기억은 남겨 다음 클릭은 시작만 부른다", async () => {
    postUserOrderPayment
      .mockRejectedValueOnce(httpError(500, { message: "LINE Pay failed" }))
      .mockResolvedValueOnce(startedPayment);
    const { result } = render();

    await act(() => result.current.submit());
    expect(toastError).toHaveBeenCalledWith(messages.payment_start_failed);
    expect(sessionStorage.getItem("order:pending")).not.toBeNull();

    await act(() => result.current.submit());

    expect(createUserOrder).toHaveBeenCalledTimes(1);
    expect(postUserOrderPayment).toHaveBeenCalledTimes(2);
    expect(openPaymentWindow).toHaveBeenCalledTimes(1);
  });

  it("external 이면 대기 정보를 내놓는다", async () => {
    openPaymentWindow.mockResolvedValue("external");
    const { result } = render();

    await act(() => result.current.submit());

    expect(result.current.external).toEqual({
      mode: "external",
      orderId: 481,
      orderNumber: "SM-20261104-000481",
      paymentId: 12,
      resultToken: "Xy9",
    });
  });

  it("retryPayment 는 시작만 다시 부르고 409 면 조용히 끝난다", async () => {
    openPaymentWindow.mockResolvedValue("external");
    const { result } = render();
    await act(() => result.current.submit());

    postUserOrderPayment.mockRejectedValueOnce(
      httpError(409, { message: "already paid" }),
    );
    await act(() => result.current.retryPayment());

    expect(createUserOrder).toHaveBeenCalledTimes(1);
    expect(postUserOrderPayment).toHaveBeenCalledTimes(2);
    expect(toastError).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.isRetrying).toBe(false));
  });

  it("retryPayment 성공은 결제창을 다시 연다", async () => {
    openPaymentWindow.mockResolvedValue("external");
    const { result } = render();
    await act(() => result.current.submit());

    await act(() => result.current.retryPayment());

    expect(openPaymentWindow).toHaveBeenCalledTimes(2);
  });

  it("같은 탭으로 떠나는 중에는 버튼이 다시 열리지 않아 두 번째 결제 시작이 없다", async () => {
    const { result } = render();

    await act(() => result.current.submit());
    expect(result.current.isSubmitting).toBe(true);

    await act(() => result.current.submit());

    expect(postUserOrderPayment).toHaveBeenCalledTimes(1);
  });

  it("bfcache 로 돌아오면(pageshow persisted) 다시 누를 수 있다", async () => {
    const { result } = render();

    await act(() => result.current.submit());
    act(() => {
      const event = new Event("pageshow") as PageTransitionEvent;
      Object.defineProperty(event, "persisted", { value: true });
      window.dispatchEvent(event);
    });

    expect(result.current.isSubmitting).toBe(false);
    await act(() => result.current.submit());
    expect(postUserOrderPayment).toHaveBeenCalledTimes(2);
    expect(createUserOrder).toHaveBeenCalledTimes(1);
  });

  it("제출할 때 미리보기를 새로 받아 키를 만든다 — 화면의 옛 미리보기로 옛 주문을 재사용하지 않는다", async () => {
    const body = {
      cartItemIds: [12],
      paymentMethod: "ECPAY" as const,
      shippingType: "HOME" as const,
      useDefaultShipping: true as const,
    };
    // 화면(preview)은 옛 수량 그대로, 서버의 최신 미리보기는 수량이 바뀌었다
    savePendingOrder({
      sourceHref: "/order?cart=12",
      bodyKey: toPendingBodyKey(body, preview),
      orderId: 480,
      orderNumber: "SM-0480",
      totalAmount: 1160,
    });
    getFreshPreview.mockResolvedValue({ ...preview, totalAmount: 2260 });
    const { result } = render();

    await act(() => result.current.submit());

    expect(getFreshPreview).toHaveBeenCalledTimes(1);
    expect(createUserOrder).toHaveBeenCalledTimes(1);
    expect(postUserOrderPayment).toHaveBeenCalledWith({
      orderId: 481,
      languageCode: "ko",
    });
  });

  describe("새 탭(데스크톱)", () => {
    const tab = () => ({ close: vi.fn(), closed: false });

    it("클릭 순간 빈 탭을 열고, 결제창이 그 탭에 열리면 원래 탭은 대기 화면이 된다", async () => {
      const paymentTab = tab();
      openPaymentTab.mockReturnValue(paymentTab);
      openPaymentWindow.mockResolvedValue("new-tab");
      const { result } = render();

      await act(() => result.current.submit());

      expect(openPaymentTab).toHaveBeenCalledWith(
        messages.payment_opening_window,
      );
      expect(openPaymentWindow).toHaveBeenCalledWith(
        startedPayment.data.handoffUrl,
        paymentTab,
      );
      expect(paymentTab.close).not.toHaveBeenCalled();
      expect(result.current.external).toMatchObject({
        mode: "new-tab",
        orderId: 481,
        resultToken: "Xy9",
      });
      expect(result.current.isSubmitting).toBe(false);
    });

    it("빈 탭은 API 를 기다리기 전에(동기로) 연다", () => {
      openPaymentTab.mockReturnValue(tab());
      const { result } = render();

      void result.current.submit();

      expect(openPaymentTab).toHaveBeenCalledTimes(1);
      expect(ensureChecked).toHaveBeenCalledTimes(1);
    });

    it("전자발표 확인이 막히면 빈 탭을 닫는다", async () => {
      const paymentTab = tab();
      openPaymentTab.mockReturnValue(paymentTab);
      ensureChecked.mockResolvedValue({ ok: false });
      const { result } = render();

      await act(() => result.current.submit());

      expect(paymentTab.close).toHaveBeenCalledTimes(1);
    });

    it("주문 생성이 실패하면 빈 탭을 닫는다", async () => {
      const paymentTab = tab();
      openPaymentTab.mockReturnValue(paymentTab);
      createUserOrder.mockRejectedValue(
        httpError(400, { message: "bad", data: { field: "loveCode" } }),
      );
      const { result } = render();

      await act(() => result.current.submit());

      expect(paymentTab.close).toHaveBeenCalledTimes(1);
    });

    it("재고 부족이면 빈 탭을 닫는다", async () => {
      const paymentTab = tab();
      openPaymentTab.mockReturnValue(paymentTab);
      postUserOrderPayment.mockRejectedValue(
        httpError(409, { message: "m", data: { productVariantIds: [101] } }),
      );
      const { result } = render();

      await act(() => result.current.submit());

      expect(paymentTab.close).toHaveBeenCalledTimes(1);
      expect(result.current.stockShortage).toEqual({
        productVariantIds: [101],
      });
    });

    it("다시 결제하기도 새 탭으로 연다", async () => {
      openPaymentTab.mockReturnValue(tab());
      openPaymentWindow.mockResolvedValue("new-tab");
      const { result } = render();
      await act(() => result.current.submit());

      const retryTab = tab();
      openPaymentTab.mockReturnValue(retryTab);
      await act(() => result.current.retryPayment());

      expect(openPaymentWindow).toHaveBeenLastCalledWith(
        startedPayment.data.handoffUrl,
        retryTab,
      );
      expect(retryTab.close).not.toHaveBeenCalled();
    });
  });
});
