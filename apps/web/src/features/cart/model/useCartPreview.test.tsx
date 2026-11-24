import type { ReactNode } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { USER_CART_QUERY_KEY } from "@entities/cart";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";

import { useCartPreview } from "./useCartPreview";

const postUserCartPreview = vi.fn();
vi.mock("@shared/services/userCart", async (importOriginal) => ({
  ...(await importOriginal<typeof UserCartService>()),
  postUserCartPreview: (req: unknown) => postUserCartPreview(req),
}));

// eslint-disable-next-line import/order
import type * as UserCartService from "@shared/services/userCart";

vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));
// @entities/cart 공개 API 가 라인 UI(Link)까지 끌어온다
vi.mock("@/i18n/navigation", () => ({ Link: () => null }));

const preview = (totalProductAmount: number) => ({
  result: true,
  data: {
    brandGroups: [],
    totalProductAmount,
    estimatedShippingFee: 60,
    remoteIslandFee: 100,
    freeShippingThreshold: 1500,
    amountToFreeShipping: 0,
    internationalDiscount: 0,
    nextDiscountThreshold: 4000,
    nextDiscountAmount: 120,
    amountToNextDiscount: 4000 - totalProductAmount,
    estimatedTotalAmount: totalProductAmount + 60,
    totalCount: 1,
  },
});

let queryClient: QueryClient;

// 렌더마다 새 클라이언트를 만들면 rerender 때 캐시가 사라진다 — 테스트마다 하나만 쓴다
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

/** 디바운스 타이머를 넘기고 응답 promise 까지 흘려보낸다 */
const flush = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400);
  });
};

describe("useCartPreview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    useUserAuthStore.setState({ id: 1, isAuthenticated: true });
    postUserCartPreview.mockResolvedValue(preview(1000));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("고른 라인만 정렬해 미리보기에 넘기고 그 금액을 돌려준다", async () => {
    const { result } = renderHook(() => useCartPreview(new Set([3, 1])), {
      wrapper,
    });

    await flush();

    expect(postUserCartPreview).toHaveBeenCalledWith({
      cartItemIds: [1, 3],
      languageCode: "ko",
    });
    expect(result.current.preview?.totalProductAmount).toBe(1000);
    expect(result.current.isRecalculating).toBe(false);
  });

  it("아무것도 고르지 않았으면 부르지 않는다", async () => {
    const { result } = renderHook(() => useCartPreview(new Set()), {
      wrapper,
    });

    await flush();

    expect(postUserCartPreview).not.toHaveBeenCalled();
    expect(result.current.preview).toBeUndefined();
    expect(result.current.isRecalculating).toBe(false);
  });

  it("첫 선택은 바로 묻고, 연달아 바꾸면 마지막 선택만 묻는다", async () => {
    const { rerender } = renderHook(
      ({ ids }: { ids: number[] }) => useCartPreview(new Set(ids)),
      { wrapper, initialProps: { ids: [1] } },
    );

    rerender({ ids: [1, 2] });
    rerender({ ids: [1, 2, 3] });
    await flush();

    expect(
      postUserCartPreview.mock.calls.map(([req]) => req.cartItemIds),
    ).toEqual([[1], [1, 2, 3]]);
  });

  it("장바구니가 무효화되면(수량 변경·삭제 반영) 같은 라인이어도 다시 계산하고, 그동안 다시 계산 중으로 알린다", async () => {
    const { result } = renderHook(() => useCartPreview(new Set([1])), {
      wrapper,
    });

    await flush();
    expect(result.current.preview?.totalProductAmount).toBe(1000);

    // 응답을 붙잡아 두고 그사이 상태를 본다
    let respond: (value: unknown) => void = () => {};
    postUserCartPreview.mockReturnValue(
      new Promise((resolve) => {
        respond = resolve;
      }),
    );
    await act(async () => {
      void queryClient.invalidateQueries({ queryKey: USER_CART_QUERY_KEY });
      await vi.advanceTimersByTimeAsync(0);
    });

    // 새 금액이 오기 전에는 직전 금액을 보여주며 다시 계산 중이다
    expect(result.current.preview?.totalProductAmount).toBe(1000);
    expect(result.current.isRecalculating).toBe(true);

    respond(preview(2000));
    await flush();

    expect(postUserCartPreview).toHaveBeenCalledTimes(2);
    expect(result.current.preview?.totalProductAmount).toBe(2000);
    expect(result.current.isRecalculating).toBe(false);
  });
});
