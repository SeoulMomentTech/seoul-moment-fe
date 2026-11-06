import type { ReactNode } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { usePaymentResultQuery } from "./usePaymentResultQuery";

const getPaymentResult = vi.fn();
vi.mock("@shared/services/payment", () => ({
  getPaymentResult: (token: string) => getPaymentResult(token),
}));

const result = (status: string) => ({
  result: true,
  data: {
    orderId: 481,
    orderNumber: "SM-20261104-000481",
    orderStatus: "PENDING",
    payment: { paymentId: 12, method: "ECPAY", status, amount: 1160 },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

describe("usePaymentResultQuery", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    getPaymentResult.mockReset();
  });

  it("READY 도 폴링 대상이다", async () => {
    getPaymentResult
      .mockResolvedValueOnce(result("READY"))
      .mockResolvedValueOnce(result("PAID"));

    const { result: hook } = renderHook(() => usePaymentResultQuery("tok"), {
      wrapper,
    });

    await waitFor(() =>
      expect(hook.current.data?.payment.status).toBe("READY"),
    );
    await act(() => vi.advanceTimersByTimeAsync(3100));
    await waitFor(() => expect(hook.current.data?.payment.status).toBe("PAID"));

    expect(getPaymentResult).toHaveBeenCalledTimes(2);
    expect(getPaymentResult).toHaveBeenCalledWith("tok");
  });

  it("PAID 면 더 묻지 않는다", async () => {
    getPaymentResult.mockResolvedValue(result("PAID"));

    const { result: hook } = renderHook(() => usePaymentResultQuery("tok"), {
      wrapper,
    });

    await waitFor(() => expect(hook.current.data?.payment.status).toBe("PAID"));
    await act(() => vi.advanceTimersByTimeAsync(7000));

    expect(getPaymentResult).toHaveBeenCalledTimes(1);
  });

  it("토큰이 없으면 부르지 않는다", () => {
    renderHook(() => usePaymentResultQuery(null), { wrapper });

    expect(getPaymentResult).not.toHaveBeenCalled();
  });
});
