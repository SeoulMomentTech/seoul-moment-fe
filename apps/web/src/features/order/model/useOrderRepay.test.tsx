import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";

import { useOrderRepay } from "./useOrderRepay";

const postUserOrderPayment = vi.fn();
vi.mock("@shared/services/userOrder", async (importOriginal) => ({
  ...(await importOriginal<typeof UserOrderService>()),
  postUserOrderPayment: (req: unknown) => postUserOrderPayment(req),
}));

// eslint-disable-next-line import/order
import type * as UserOrderService from "@shared/services/userOrder";

const openPaymentWindow = vi.fn();
const openPaymentTab = vi.fn();
vi.mock("./paymentWindow", () => ({
  openPaymentWindow: (url: string, tab?: unknown) =>
    openPaymentWindow(url, tab),
  openPaymentTab: (text: string) => openPaymentTab(text),
}));

const toastError = vi.fn();
vi.mock("sonner", () => ({ toast: { error: (m: string) => toastError(m) } }));

vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

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

const started = {
  result: true,
  data: {
    paymentId: 13,
    method: "ECPAY",
    handoffUrl: "https://api-dev.test/payment/ecpay/handoff/Ab3",
    resultToken: "Ab3",
  },
};

const messages = {
  payment_opening_window: "결제창을 여는 중…",
  payment_start_failed: "결제를 시작할 수 없어요",
  please_try_again: "다시 시도해주세요",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={
      new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    }
  >
    <NextIntlClientProvider locale="ko" messages={messages}>
      {children}
    </NextIntlClientProvider>
  </QueryClientProvider>
);

const onChanged = vi.fn();
const render = () =>
  renderHook(() => useOrderRepay({ orderId: 481, onChanged }), { wrapper });

describe("useOrderRepay", () => {
  beforeEach(() => {
    postUserOrderPayment.mockResolvedValue(started);
    openPaymentTab.mockReturnValue(null);
    openPaymentWindow.mockResolvedValue("same-tab");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("결제 시작만 부르고 결제창으로 보낸다", async () => {
    const { result } = render();

    await act(() => result.current.repay());

    expect(postUserOrderPayment).toHaveBeenCalledWith({
      orderId: 481,
      languageCode: "ko",
    });
    expect(openPaymentWindow).toHaveBeenCalledWith(
      started.data.handoffUrl,
      null,
    );
    expect(result.current.isAwaiting).toBe(false);
  });

  it("새 탭·외부 브라우저로 열면 이 화면은 결과를 기다린다", async () => {
    const tab = { close: vi.fn(), closed: false };
    openPaymentTab.mockReturnValue(tab);
    openPaymentWindow.mockResolvedValue("new-tab");
    const { result } = render();

    await act(() => result.current.repay());

    expect(openPaymentWindow).toHaveBeenCalledWith(
      started.data.handoffUrl,
      tab,
    );
    expect(tab.close).not.toHaveBeenCalled();
    expect(result.current.isAwaiting).toBe(true);
  });

  it("409(이미 결제됨·입금 대기)면 서버 문구를 토스트하고 주문을 다시 읽는다", async () => {
    const tab = { close: vi.fn(), closed: false };
    openPaymentTab.mockReturnValue(tab);
    postUserOrderPayment.mockRejectedValue(
      httpError(409, { message: "already paid" }),
    );
    const { result } = render();

    await act(() => result.current.repay());

    expect(toastError).toHaveBeenCalledWith("already paid");
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(tab.close).toHaveBeenCalledTimes(1);
  });

  it("5xx 면 결제 시작 실패 문구", async () => {
    postUserOrderPayment.mockRejectedValue(httpError(500, {}));
    const { result } = render();

    await act(() => result.current.repay());

    expect(toastError).toHaveBeenCalledWith(messages.payment_start_failed);
  });

  it("연타해도 결제 시작은 한 번", async () => {
    const { result } = render();

    await act(async () => {
      void result.current.repay();
      void result.current.repay();
    });

    expect(postUserOrderPayment).toHaveBeenCalledTimes(1);
  });
});
