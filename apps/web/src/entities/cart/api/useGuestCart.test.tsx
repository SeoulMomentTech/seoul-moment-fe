import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useGuestCart } from "./useGuestCart";
import { useGuestCartIdStore } from "../model/guestId";

const createGuestCartItems = vi.fn();
const getGuestCart = vi.fn();
const getGuestCartCount = vi.fn();
const updateGuestCartItem = vi.fn();
const deleteGuestCartItem = vi.fn();
const deleteGuestCart = vi.fn();

vi.mock("@shared/services/guestCart", () => ({
  createGuestCartItems: (...args: unknown[]) => createGuestCartItems(...args),
  getGuestCart: (...args: unknown[]) => getGuestCart(...args),
  getGuestCartCount: (...args: unknown[]) => getGuestCartCount(...args),
  updateGuestCartItem: (...args: unknown[]) => updateGuestCartItem(...args),
  deleteGuestCartItem: (...args: unknown[]) => deleteGuestCartItem(...args),
  deleteGuestCart: (...args: unknown[]) => deleteGuestCart(...args),
}));

vi.mock("@shared/lib/hooks", () => ({ useLanguage: () => "ko" }));

const emptyCart = {
  brandGroups: [],
  totalProductAmount: 0,
  estimatedShippingFee: 0,
  remoteIslandFee: 0,
  freeShippingThreshold: 0,
  amountToFreeShipping: 0,
  estimatedTotalAmount: 0,
  totalCount: 0,
};

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// ky 의 HTTPError 와 같은 모양이어야 한다 — `getErrorInfo` 는 ky 의 isHTTPError 로
// 판별하고, 여기서는(useCart.test.tsx 와 달리) ky 를 목하지 않으므로 실제 판정 로직
// (`error.name === "HTTPError"`)을 그대로 통과해야 한다.
const httpError = (status: number) =>
  Object.assign(new Error("failed"), {
    name: "HTTPError",
    response: { status },
  });

describe("useGuestCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGuestCartIdStore.setState({ guestId: null });
    getGuestCart.mockResolvedValue({ result: true, data: emptyCart });
    getGuestCartCount.mockResolvedValue({ result: true, data: { count: 0 } });
    createGuestCartItems.mockResolvedValue({
      result: true,
      data: { guestId: "g-1", items: [], totalCount: 1 },
    });
  });

  it("guestId 가 없으면 조회하지 않고, 스켈레톤에 갇히지 않는다", () => {
    const { result } = renderHook(() => useGuestCart(null), { wrapper });

    expect(getGuestCart).not.toHaveBeenCalled();
    // 비활성 쿼리는 상태가 pending 으로 남는다. 그대로 흘리면 CartPage 가 영영 스켈레톤이다.
    expect(result.current.isPending).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("첫 담기 응답의 guestId 를 저장한다", async () => {
    const { result } = renderHook(() => useGuestCart(null), { wrapper });

    await act(async () => {
      await result.current.addItems([{ productVariantId: 101, quantity: 1 }]);
    });

    expect(createGuestCartItems).toHaveBeenCalledWith({
      guestId: undefined,
      items: [{ productVariantId: 101, quantity: 1 }],
    });
    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });

  it("guestId 가 없을 때 동시에 담아도 헤더 없는 요청은 한 번뿐이다", async () => {
    // 두 번 나가면 서버가 게스트 ID 를 둘 발급해 카트가 갈라진다.
    const { result } = renderHook(() => useGuestCart(null), { wrapper });

    await act(async () => {
      await Promise.all([
        result.current.addItems([{ productVariantId: 101, quantity: 1 }]),
        result.current.addItems([{ productVariantId: 102, quantity: 1 }]),
      ]);
    });

    expect(createGuestCartItems).toHaveBeenCalledTimes(2);
    expect(createGuestCartItems.mock.calls[0][0].guestId).toBeUndefined();
    expect(createGuestCartItems.mock.calls[1][0].guestId).toBe("g-1");
  });

  it("수량 변경이 404 면 guestId 를 버린다", async () => {
    useGuestCartIdStore.setState({ guestId: "g-1" });
    updateGuestCartItem.mockRejectedValue(httpError(404));

    const { result } = renderHook(() => useGuestCart("g-1"), { wrapper });

    await act(async () => {
      await result.current.commitQuantity(101, 2).catch(() => null);
    });

    await waitFor(() =>
      expect(useGuestCartIdStore.getState().guestId).toBeNull(),
    );
  });

  it("선택 삭제는 라인마다 부르고, 전체 비우기는 한 번만 부른다", async () => {
    useGuestCartIdStore.setState({ guestId: "g-1" });
    deleteGuestCartItem.mockResolvedValue(undefined);
    deleteGuestCart.mockResolvedValue(undefined);

    const { result } = renderHook(() => useGuestCart("g-1"), { wrapper });

    await act(async () => {
      result.current.removeItems([101, 102]);
    });
    await waitFor(() => expect(deleteGuestCartItem).toHaveBeenCalledTimes(2));

    await act(async () => {
      result.current.removeAll();
    });
    await waitFor(() => expect(deleteGuestCart).toHaveBeenCalledTimes(1));
  });
});
