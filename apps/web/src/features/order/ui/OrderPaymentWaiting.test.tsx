import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import ko from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { OrderPaymentWaiting } from "./OrderPaymentWaiting";

const getUserOrderDetail = vi.fn();
vi.mock("@shared/services/userOrder", async (importOriginal) => ({
  ...(await importOriginal<typeof UserOrderService>()),
  getUserOrderDetail: (orderId: number) => getUserOrderDetail(orderId),
}));

// eslint-disable-next-line import/order
import type * as UserOrderService from "@shared/services/userOrder";

const replace = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

const detail = (
  status: string,
  payment: { paymentId: number; status: string } | null = null,
) => ({
  result: true,
  data: {
    orderId: 481,
    orderNumber: "SM-20261104-000481",
    status,
    totalAmount: 1160,
    payment,
    items: [],
    shipping: {},
  },
});

const external = {
  mode: "external" as const,
  orderId: 481,
  orderNumber: "SM-20261104-000481",
  paymentId: 12,
  resultToken: "Xy9",
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <NextIntlClientProvider locale="ko" messages={ko}>
      {children}
    </NextIntlClientProvider>
  </QueryClientProvider>
);

describe("OrderPaymentWaiting", () => {
  beforeEach(() => {
    useUserAuthStore.setState({ id: 1, isAuthenticated: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("PENDING 이면 외부 결제 중 문구와 주문번호를 그린다", async () => {
    getUserOrderDetail.mockResolvedValue(detail("PENDING"));

    render(
      <OrderPaymentWaiting
        external={external}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
      { wrapper },
    );

    expect(screen.getByText(ko.payment_external_title)).toBeInTheDocument();
    expect(screen.getByText(ko.payment_external_hint)).toBeInTheDocument();
    expect(screen.getByText("SM-20261104-000481")).toBeInTheDocument();
    await waitFor(() => expect(getUserOrderDetail).toHaveBeenCalledWith(481));
    expect(replace).not.toHaveBeenCalled();
  });

  it("PAID 가 되면 결과 페이지로 replace 한다", async () => {
    getUserOrderDetail.mockResolvedValue(
      detail("PAID", { paymentId: 12, status: "PAID" }),
    );

    render(
      <OrderPaymentWaiting
        external={external}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
      { wrapper },
    );

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/payment/result?h=Xy9"),
    );
  });

  it("PAYMENT_WAITING 도 결과 페이지로 간다", async () => {
    getUserOrderDetail.mockResolvedValue(
      detail("PAYMENT_WAITING", { paymentId: 12, status: "WAITING_DEPOSIT" }),
    );

    render(
      <OrderPaymentWaiting
        external={external}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
      { wrapper },
    );

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith("/payment/result?h=Xy9"),
    );
  });

  it("이번 시도가 CANCELED 면 결제되지 않았다는 문구로 바뀐다", async () => {
    getUserOrderDetail.mockResolvedValue(
      detail("PENDING", { paymentId: 12, status: "CANCELED" }),
    );

    render(
      <OrderPaymentWaiting
        external={external}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
      { wrapper },
    );

    expect(
      await screen.findByText(ko.payment_failed_title),
    ).toBeInTheDocument();
    expect(
      screen.getByText(ko.payment_not_paid_retry_hint),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("이전 시도의 실패는 무시한다", async () => {
    getUserOrderDetail.mockResolvedValue(
      detail("PENDING", { paymentId: 11, status: "CANCELED" }),
    );

    render(
      <OrderPaymentWaiting
        external={external}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
      { wrapper },
    );

    await waitFor(() => expect(getUserOrderDetail).toHaveBeenCalled());
    expect(screen.getByText(ko.payment_external_title)).toBeInTheDocument();
    expect(screen.queryByText(ko.payment_failed_title)).not.toBeInTheDocument();
  });

  it("다시 결제하기는 onRetry 를 부르고 끝나면 주문을 다시 읽는다", async () => {
    getUserOrderDetail.mockResolvedValue(detail("PENDING"));
    const onRetry = vi.fn().mockResolvedValue(undefined);

    render(
      <OrderPaymentWaiting
        external={external}
        isRetrying={false}
        onRetry={onRetry}
      />,
      { wrapper },
    );
    await waitFor(() => expect(getUserOrderDetail).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: ko.payment_retry }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getUserOrderDetail).toHaveBeenCalledTimes(2));
  });

  it("새 탭 모드면 새 탭에서 결제 중이라는 문구다", async () => {
    getUserOrderDetail.mockResolvedValue(detail("PENDING"));

    render(
      <OrderPaymentWaiting
        external={{ ...external, mode: "new-tab" }}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
      { wrapper },
    );

    expect(screen.getByText(ko.payment_new_tab_title)).toBeInTheDocument();
    expect(screen.getByText(ko.payment_new_tab_hint)).toBeInTheDocument();
    expect(screen.queryByText(ko.payment_external_title)).toBeNull();
  });

  it("진행 마크가 돌고 다시 결제하기 안내가 함께 보인다", async () => {
    getUserOrderDetail.mockResolvedValue(detail("PENDING"));

    render(
      <OrderPaymentWaiting
        external={external}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
      { wrapper },
    );

    const mark = screen.getByTestId("status-mark");
    expect(mark).toHaveAttribute("data-tone", "progress");
    expect(mark).toHaveAttribute("data-spinning", "true");
    expect(screen.getByText(ko.payment_retry_notice)).toBeInTheDocument();
  });

  it("이번 시도가 실패하면 빨강 마크로 바뀌고 돌지 않는다", async () => {
    getUserOrderDetail.mockResolvedValue(
      detail("PENDING", { paymentId: 12, status: "FAILED" }),
    );

    render(
      <OrderPaymentWaiting
        external={external}
        isRetrying={false}
        onRetry={vi.fn()}
      />,
      { wrapper },
    );

    await screen.findByText(ko.payment_failed_title);
    const mark = screen.getByTestId("status-mark");
    expect(mark).toHaveAttribute("data-tone", "danger");
    expect(mark).toHaveAttribute("data-spinning", "false");
  });
});
