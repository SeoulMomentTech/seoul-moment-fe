import type { ReactNode } from "react";

import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useGuestCart } from "./useGuestCart";
import { useGuestCartIdStore } from "../model/guestId";

const createGuestCartItems = vi.fn();
const getGuestCart = vi.fn();
const updateGuestCartItem = vi.fn();
const deleteGuestCartItem = vi.fn();
const deleteGuestCart = vi.fn();

vi.mock("@shared/services/guestCart", () => ({
  createGuestCartItems: (...args: unknown[]) => createGuestCartItems(...args),
  getGuestCart: (...args: unknown[]) => getGuestCart(...args),
  updateGuestCartItem: (...args: unknown[]) => updateGuestCartItem(...args),
  deleteGuestCartItem: (...args: unknown[]) => deleteGuestCartItem(...args),
  deleteGuestCart: (...args: unknown[]) => deleteGuestCart(...args),
}));

vi.mock("@shared/lib/hooks", () => ({ useLanguage: () => "ko" }));

// `useGuestCart` 는 실패 토스트(`notifyFailure`)를 위해 `useTranslations` 를 부른다.
// 이 테스트 스위트는 route 밖이라 진짜 NextIntlClientProvider 를 씌우는 대신 키를 그대로
// 돌려주는 최소 mock 으로 충분하다.
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

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

  // 회귀 방지: 목록 조회의 404 를 놓치면 ID 가 localStorage 에 영영 남아, 다음 방문마다
  // 같은 404 를 반복하며 "다시 시도" 버튼도 영영 그 404 로만 끝난다.
  it("목록 조회가 404 면 guestId 를 버리고, 빈 카트로 읽힌다", async () => {
    useGuestCartIdStore.setState({ guestId: "g-1" });
    getGuestCart.mockRejectedValue(httpError(404));

    const { result, rerender } = renderHook(
      ({ guestId }: { guestId: string | null }) => useGuestCart(guestId),
      { wrapper, initialProps: { guestId: "g-1" as string | null } },
    );

    await waitFor(() =>
      expect(useGuestCartIdStore.getState().guestId).toBeNull(),
    );

    // 실제 화면은 store 가 비면 이 훅을 guestId=null 로 다시 부른다(`useCartSource`).
    rerender({ guestId: null });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isPending).toBe(false);
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

  // 회귀 방지: 대기하던 두 번째 담기가 첫 담기의 실패를 물려받으면, 그 라인은 서버에
  // 닿지도 못한 채 조용히 사라지고 사용자는 엉뚱한 라인의 재고 토스트만 본다.
  it("첫 담기가 실패해도, 대기하던 두 번째 담기는 스스로 헤더 없는 요청을 보낸다", async () => {
    createGuestCartItems
      .mockRejectedValueOnce(httpError(409))
      .mockResolvedValueOnce({
        result: true,
        data: { guestId: "g-2", items: [], totalCount: 1 },
      });

    const { result } = renderHook(() => useGuestCart(null), { wrapper });

    await act(async () => {
      const [first, second] = await Promise.allSettled([
        result.current.addItems([{ productVariantId: 101, quantity: 1 }]),
        result.current.addItems([{ productVariantId: 102, quantity: 1 }]),
      ]);

      // 첫 담기 자신은 여전히 실패로 끝난다 — `useCart` 가 그 실패를 보고 재고 토스트를 낸다.
      expect(first.status).toBe("rejected");
      // 두 번째 담기는 첫 담기의 실패를 물려받지 않고 스스로 낸 요청으로 성공한다.
      expect(second.status).toBe("fulfilled");
    });

    expect(createGuestCartItems).toHaveBeenCalledTimes(2);
    // 두 호출 모두 헤더 없이 나간다 — 두 번째는 첫 번째가 발급한 ID 가 없으므로(실패했으니)
    // 자기 몫으로 새로 하나를 요청한다.
    expect(createGuestCartItems.mock.calls[0][0].guestId).toBeUndefined();
    expect(createGuestCartItems.mock.calls[1][0].guestId).toBeUndefined();
    expect(useGuestCartIdStore.getState().guestId).toBe("g-2");
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

  // 회귀 방지: `Promise.allSettled` 로 모으기만 하고 알리지 않으면, 실패한 라인이 화면에
  // 잠깐 남았다가(재조회 전까지) 아무 설명 없이 다시 나타나 사용자가 자기 클릭을 의심하게 된다.
  it("선택 삭제 중 일부가 실패하면 사용자에게 알린다", async () => {
    useGuestCartIdStore.setState({ guestId: "g-1" });
    deleteGuestCartItem
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(httpError(500));

    const { result } = renderHook(() => useGuestCart("g-1"), { wrapper });

    await act(async () => {
      result.current.removeItems([101, 102]);
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    // 500 은 카트가 사라진 신호가 아니다 — ID 를 버릴 이유가 없다.
    expect(useGuestCartIdStore.getState().guestId).toBe("g-1");
  });
});
