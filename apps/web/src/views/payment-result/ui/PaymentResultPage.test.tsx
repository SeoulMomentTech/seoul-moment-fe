import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import ko from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";

import { PaymentResultPage } from "./PaymentResultPage";

const getPaymentResult = vi.fn();
vi.mock("@shared/services/payment", () => ({
  getPaymentResult: (token: string) => getPaymentResult(token),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={`/ko${href}`}>{children}</a>
  ),
}));

const result = (status: string) => ({
  result: true,
  data: {
    orderId: 481,
    orderNumber: "SM-20261104-000481",
    orderStatus: status === "PAID" ? "PAID" : "PENDING",
    payment: { paymentId: 12, method: "ECPAY", status, amount: 1160 },
  },
});

/** ky 의 isHTTPError 는 name 폴백이 있어 실제 Request 없이 같은 분기를 탄다 */
const notFound = () => {
  const error = new Error("Request failed with status code 404");
  error.name = "HTTPError";

  return Object.assign(error, {
    response: new Response("{}", { status: 404 }),
  });
};

const renderPage = (search: string) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={search}>
      <QueryClientProvider client={client}>
        <NextIntlClientProvider locale="ko" messages={ko}>
          {children}
        </NextIntlClientProvider>
      </QueryClientProvider>
    </NuqsTestingAdapter>
  );

  return { client, ...render(<PaymentResultPage />, { wrapper }) };
};

describe("PaymentResultPage", () => {
  beforeEach(() => {
    sessionStorage.setItem("order:pending", "{}");
    sessionStorage.setItem("order:draft", "{}");
    useUserAuthStore.setState({ id: 0, isAuthenticated: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    getPaymentResult.mockReset();
    sessionStorage.clear();
  });

  it("REQUESTED → PAID 로 바뀌면 완료 화면이고 pending·draft 를 지운다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    getPaymentResult
      .mockResolvedValueOnce(result("REQUESTED"))
      .mockResolvedValueOnce(result("PAID"));

    renderPage("?h=tok");

    expect(
      await screen.findByText(ko.payment_checking_title),
    ).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(3100));

    expect(await screen.findByText(ko.payment_paid_title)).toBeInTheDocument();
    expect(getPaymentResult).toHaveBeenCalledWith("tok");
    expect(sessionStorage.getItem("order:pending")).toBeNull();
    expect(sessionStorage.getItem("order:draft")).toBeNull();
  });

  it("로그인 상태에서 PAID 면 장바구니 쿼리를 무효화한다", async () => {
    useUserAuthStore.setState({ id: 7, isAuthenticated: true });
    getPaymentResult.mockResolvedValue(result("PAID"));

    const { client } = renderPage("?h=tok");
    const invalidate = vi.spyOn(client, "invalidateQueries");

    await screen.findByText(ko.payment_paid_title);
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["user", "cart"] }),
      ),
    );
  });

  it("404 면 찾을 수 없음", async () => {
    getPaymentResult.mockRejectedValue(notFound());

    renderPage("?h=expired");

    expect(
      await screen.findByText(ko.payment_result_not_found_title),
    ).toBeInTheDocument();
  });

  it("h 가 없으면 찾을 수 없음이고 호출하지 않는다", async () => {
    renderPage("");

    expect(
      await screen.findByText(ko.payment_result_not_found_title),
    ).toBeInTheDocument();
    expect(getPaymentResult).not.toHaveBeenCalled();
  });

  it("1분이 지나도 REQUESTED 면 늦어진다는 문구로 바뀐다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    getPaymentResult.mockResolvedValue(result("REQUESTED"));

    renderPage("?h=tok");

    expect(
      await screen.findByText(ko.payment_checking_title),
    ).toBeInTheDocument();
    await act(() => vi.advanceTimersByTimeAsync(60_000));

    expect(
      await screen.findByText(ko.payment_checking_delayed),
    ).toBeInTheDocument();
  });
});
