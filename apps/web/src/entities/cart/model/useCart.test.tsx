import type { ReactNode } from "react";

import type * as Ky from "ky";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CreateUserCartItemReq,
  UpdateUserCartItemReq,
} from "@shared/services/userCart";

import messages from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import type { CartLineDraft } from "./types";
import { useCart } from "./useCart";
import { useCartStore } from "./useCartStore";

// 담기 응답의 cartItemId 를 라인마다 다르게 주려고 순번을 센다.
let nextCartItemId = 0;

const createUserCartItem = vi.fn<(req: CreateUserCartItemReq) => unknown>(
  () => {
    nextCartItemId += 1;

    return Promise.resolve({
      result: true,
      data: { cartItemId: nextCartItemId, totalCount: nextCartItemId },
    });
  },
);
const updateUserCartItem = vi.fn<(req: UpdateUserCartItemReq) => unknown>(() =>
  Promise.resolve({ result: true, data: null }),
);
const deleteUserCartItems = vi.fn<(ids?: number[]) => unknown>(() =>
  Promise.resolve(),
);

/** 정정이 읽어갈 서버 장바구니. 테스트마다 갈아끼운다. */
let serverCart: Array<{
  cartItemId: number;
  quantity: number;
  stockQuantity: number;
}> = [];

const getUserCart = vi.fn(() =>
  Promise.resolve({
    result: true,
    data: {
      brandGroups: [
        {
          brandId: 1,
          brandName: "OSSMOVE",
          brandProfileImage: "",
          items: serverCart,
          productAmount: 0,
        },
      ],
      totalProductAmount: 0,
      estimatedShippingFee: 0,
      remoteIslandFee: 0,
      freeShippingThreshold: 0,
      amountToFreeShipping: 0,
      estimatedTotalAmount: 0,
      totalCount: serverCart.length,
    },
  }),
);

/** ky 의 HTTPError 와 같은 모양 — `getErrorInfo` 는 response.status 만 본다. */
class FakeHTTPError extends Error {
  name = "HTTPError";
  constructor(public response: { status: number; url: string }) {
    super(`Request failed with status code ${response.status}`);
  }
}

const conflict = () =>
  Promise.reject(
    new FakeHTTPError({ status: 409, url: "https://api/user/cart" }),
  );

vi.mock("@shared/services/userCart", () => ({
  createUserCartItem: (req: CreateUserCartItemReq) => createUserCartItem(req),
  updateUserCartItem: (req: UpdateUserCartItemReq) => updateUserCartItem(req),
  deleteUserCartItems: (ids?: number[]) => deleteUserCartItems(ids),
  deleteUserCartItem: vi.fn(),
  getUserCart: () => getUserCart(),
  getUserCartCount: vi.fn(),
}));

// `getErrorInfo` 는 ky 의 isHTTPError 로 판별한다. name 이 "HTTPError" 면 통과한다.
vi.mock("ky", async (importOriginal) => {
  const actual = await importOriginal<typeof Ky>();

  return {
    ...actual,
    isHTTPError: (error: unknown) =>
      error instanceof Error && error.name === "HTTPError",
  };
});

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

// `useLanguage` 가 useParams 로 locale 을 읽는다. 라우트 밖이라 null 이 온다.
vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

const draft = (
  productId: number,
  optionValueId: number,
  productVariantId?: number,
): CartLineDraft => ({
  productId,
  productVariantId,
  quantity: 1,
  productName: `상품 ${productId}`,
  brandId: "1",
  brandName: "OSSMOVE",
  brandProfileImg: "",
  imageUrl: "",
  price: 1000,
  discountPrice: 0,
  options: [{ type: "SIZE", optionValueId, value: "M" }],
  external: [],
});

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

const setup = () => renderHook(() => useCart(), { wrapper });

beforeEach(() => {
  nextCartItemId = 0;
  serverCart = [];
  getUserCart.mockClear();
  useCartStore.setState({ lines: [], ownerId: 0 });
  createUserCartItem.mockClear();
  updateUserCartItem.mockClear();
  deleteUserCartItems.mockClear();
});

describe("담기", () => {
  it("서버에도 담고 돌아온 cartItemId 를 라인에 붙인다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10, 501)]);
    });

    await waitFor(() =>
      expect(result.current.lines[0].cartItemId).toBe(nextCartItemId),
    );
    expect(createUserCartItem).toHaveBeenCalledWith({
      productVariantId: 501,
      quantity: 1,
    });
  });

  // SKU 를 모르면 서버에 담을 방법이 없다. 로컬 담기는 그대로 둔다.
  it("productVariantId 가 없는 라인은 서버에 보내지 않는다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10)]);
    });

    expect(result.current.lines).toHaveLength(1);
    expect(createUserCartItem).not.toHaveBeenCalled();
  });
});

describe("삭제", () => {
  it("서버 id 를 가진 라인만 모아 한 번에 지운다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10, 501), draft(2, 20, 502)]);
    });
    await waitFor(() =>
      expect(result.current.lines.every((line) => line.cartItemId)).toBe(true),
    );

    const [first, second] = result.current.lines;

    // mutate 는 mutationFn 을 마이크로태스크에서 호출하므로 flush 가 필요하다.
    await act(async () => {
      result.current.removeLines([first.lineId, second.lineId]);
    });

    expect(result.current.lines).toHaveLength(0);
    expect(deleteUserCartItems).toHaveBeenCalledWith([
      first.cartItemId,
      second.cartItemId,
    ]);
  });

  // 회귀 방지: `deleteUserCartItems()` 를 빈 인자로 부르면 장바구니 전체가 날아간다.
  it("지울 서버 라인이 없으면 아예 호출하지 않는다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10)]);
    });
    await act(async () => {
      result.current.removeLines([result.current.lines[0].lineId]);
    });

    expect(result.current.lines).toHaveLength(0);
    expect(deleteUserCartItems).not.toHaveBeenCalled();
  });

  it("되돌리기는 서버에 다시 담고 새 cartItemId 를 받는다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10, 501)]);
    });
    await waitFor(() => expect(result.current.lines[0].cartItemId).toBe(1));

    const removed = result.current.lines;

    await act(async () => {
      result.current.removeLines([removed[0].lineId]);
    });
    act(() => {
      result.current.restoreLines(removed);
    });

    await waitFor(() => expect(result.current.lines[0].cartItemId).toBe(2));
    expect(createUserCartItem).toHaveBeenCalledTimes(2);
  });

  // 스토어가 이미 있는 라인은 건너뛴다. 그대로 서버에 보내면 수량이 두 번 더해진다.
  it("이미 살아 있는 라인은 되돌려도 다시 담지 않는다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10, 501)]);
    });
    await waitFor(() => expect(result.current.lines[0].cartItemId).toBe(1));

    act(() => {
      result.current.restoreLines(result.current.lines);
    });

    expect(createUserCartItem).toHaveBeenCalledTimes(1);
  });
});

describe("수량 변경", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("연달아 눌러도 라인당 마지막 수량 한 번만 PATCH 한다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10, 501)]);
    });
    await waitFor(() => expect(result.current.lines[0].cartItemId).toBe(1));

    const { lineId } = result.current.lines[0];

    act(() => {
      result.current.updateQuantity(lineId, 2);
      result.current.updateQuantity(lineId, 3);
      result.current.updateQuantity(lineId, 4);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(updateUserCartItem.mock.calls.map(([req]) => req)).toEqual([
      { cartItemId: 1, quantity: 4 },
    ]);
    vi.useRealTimers();
  });

  it("서버 id 가 없는 라인은 로컬 수량만 바꾼다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10)]);
    });

    act(() => {
      result.current.updateQuantity(result.current.lines[0].lineId, 5);
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.lines[0].quantity).toBe(5);
    expect(updateUserCartItem).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("재고 부족(409)", () => {
  // 409 는 "그 수량은 존재할 수 없다"는 확정 답변이다. 로컬에 남기면 영구히 어긋난다.
  it("담기가 거부되면 로컬 라인도 되돌린다", async () => {
    createUserCartItem.mockImplementationOnce(conflict);

    const { result } = setup();

    await act(async () => {
      result.current.addLines([draft(1, 10, 501)]);
    });

    await waitFor(() => expect(result.current.lines).toHaveLength(0));
    expect(getUserCart).toHaveBeenCalled();
  });

  it("수량 변경이 거부되면 서버 수량으로 정정한다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10, 501)]);
    });
    await waitFor(() => expect(result.current.lines[0].cartItemId).toBe(1));

    // 서버는 1개만 남았다고 답한다.
    serverCart = [{ cartItemId: 1, quantity: 1, stockQuantity: 1 }];
    updateUserCartItem.mockImplementationOnce(conflict);

    const { lineId } = result.current.lines[0];

    act(() => {
      result.current.updateQuantity(lineId, 5);
    });

    // 로컬은 일단 낙관적으로 5가 된다.
    expect(result.current.lines[0].quantity).toBe(5);

    await waitFor(() => expect(result.current.lines[0].quantity).toBe(1));
  });

  // 서버를 못 읽으면 무엇이 옳은지 모른다. 멋대로 지우면 멀쩡한 라인이 날아간다.
  it("정정용 재조회가 실패하면 로컬을 건드리지 않는다", async () => {
    const { result } = setup();

    act(() => {
      result.current.addLines([draft(1, 10, 501)]);
    });
    await waitFor(() => expect(result.current.lines[0].cartItemId).toBe(1));

    updateUserCartItem.mockImplementationOnce(conflict);
    getUserCart.mockImplementationOnce(() => Promise.reject(new Error("down")));

    const { lineId } = result.current.lines[0];

    act(() => {
      result.current.updateQuantity(lineId, 5);
    });

    await waitFor(() => expect(getUserCart).toHaveBeenCalled());
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].quantity).toBe(5);
  });

  // 409 가 아닌 실패는 best-effort 라 로컬을 유지한다.
  it("네트워크 실패는 로컬을 되돌리지 않는다", async () => {
    createUserCartItem.mockImplementationOnce(() =>
      Promise.reject(new Error("network")),
    );

    const { result } = setup();

    await act(async () => {
      result.current.addLines([draft(1, 10, 501)]);
    });

    expect(result.current.lines).toHaveLength(1);
    expect(getUserCart).not.toHaveBeenCalled();
  });
});
