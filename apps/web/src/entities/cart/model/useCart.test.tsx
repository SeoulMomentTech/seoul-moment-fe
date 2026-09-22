import type { ReactNode } from "react";

import type * as Ky from "ky";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import type {
  CreateGuestCartItemsReq,
  DeleteGuestCartItemReq,
  UpdateGuestCartItemReq,
} from "@shared/services/guestCart";
import type {
  CreateUserCartItemsReq,
  UpdateUserCartItemReq,
  UserCartItem,
} from "@shared/services/userCart";

import messages from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useGuestCartIdStore } from "./guestId";
import { useCart } from "./useCart";

/** 서버 장바구니. 테스트마다 갈아끼우고, mutation mock 이 실제로 고친다.
 * 회원·게스트 mock 이 이 하나의 배열을 함께 고쳐 같은 시나리오를 돌린다 — 두 어댑터가
 * 서로 바꿔 끼울 수 있다는 것이 이 스위트의 전제이므로, 서버를 하나만 둔다. */
let serverCart: UserCartItem[] = [];
let nextCartItemId = 0;

const cartItem = (
  productVariantId: number,
  quantity = 1,
  overrides: Partial<UserCartItem> = {},
): UserCartItem => {
  nextCartItemId += 1;

  return {
    cartItemId: nextCartItemId,
    productItemId: 1,
    productVariantId,
    productName: `상품 ${productVariantId}`,
    optionText: "IVORY / M",
    imageUrl: "",
    price: 1000,
    discountPrice: 0,
    quantity,
    totalPrice: 1000 * quantity,
    stockQuantity: 50,
    isSoldOut: false,
    isAvailable: true,
    ...overrides,
  };
};

/** 조회 응답의 라인 하나. 게스트 응답은 `cartItemId` 를 null 로 덮어써 실제 계약(라인 ID
 * 없음)을 그대로 재현한다 — `useGuestCart` 는 이 값을 쓰지 않지만, 화면이 읽는 `CartLine`
 * 은 이 모양을 그대로 통과시키므로 여기서 미리 맞춰 둔다. */
interface FakeCartLine extends Omit<UserCartItem, "cartItemId"> {
  cartItemId: number | null;
}

/**
 * 장바구니 조회 응답 모양. 회원(`getUserCart`)·게스트(`getGuestCart`) mock 이 함께 쓴다 —
 * 원래 `getUserCart` mock 안에 있던 로직을 뽑아냈다.
 */
const toCartResponse = (cart: readonly FakeCartLine[]) => ({
  result: true,
  data: {
    brandGroups: cart.length
      ? [
          {
            brandId: 1,
            brandName: "OSSMOVE",
            brandProfileImage: "",
            items: cart,
            productAmount: cart.reduce((n, i) => n + i.totalPrice, 0),
          },
        ]
      : [],
    totalProductAmount: cart.reduce((n, i) => n + i.totalPrice, 0),
    estimatedShippingFee: 60,
    remoteIslandFee: 140,
    freeShippingThreshold: 3000,
    amountToFreeShipping: 3000,
    estimatedTotalAmount: 0,
    totalCount: cart.length,
  },
});

const createUserCartItems = vi.fn<(req: CreateUserCartItemsReq) => unknown>(
  (req) => {
    const added = req.items.map((line) =>
      cartItem(line.productVariantId, line.quantity),
    );
    serverCart = [...serverCart, ...added];

    return Promise.resolve({
      result: true,
      data: {
        items: added.map((item) => ({
          productVariantId: item.productVariantId,
          cartItemId: item.cartItemId,
          quantity: item.quantity,
        })),
        totalCount: serverCart.length,
      },
    });
  },
);

const updateUserCartItem = vi.fn<(req: UpdateUserCartItemReq) => unknown>(
  ({ cartItemId, quantity }) => {
    serverCart = serverCart.map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity, totalPrice: item.price * quantity }
        : item,
    );

    return Promise.resolve({ result: true, data: null });
  },
);

const deleteUserCartItems = vi.fn<(ids?: number[]) => unknown>((ids) => {
  serverCart = ids
    ? serverCart.filter((item) => !ids.includes(item.cartItemId))
    : [];

  return Promise.resolve();
});

const getUserCart = vi.fn(() => Promise.resolve(toCartResponse(serverCart)));

/** 게스트 서비스도 회원과 같은 가짜 서버 카트를 보게 해서 같은 시나리오를 돌린다 */
const createGuestCartItems = vi.fn((req: CreateGuestCartItemsReq) => {
  const added = req.items.map((line) =>
    cartItem(line.productVariantId, line.quantity),
  );
  serverCart = [...serverCart, ...added];

  return Promise.resolve({
    result: true,
    data: { guestId: "g-1", items: req.items, totalCount: serverCart.length },
  });
});

const getGuestCart = vi.fn(() =>
  Promise.resolve(
    toCartResponse(serverCart.map((item) => ({ ...item, cartItemId: null }))),
  ),
);

const updateGuestCartItem = vi.fn(
  ({ productVariantId, quantity }: UpdateGuestCartItemReq) => {
    const line = serverCart.find(
      (item) => item.productVariantId === productVariantId,
    );
    if (line) line.quantity = quantity;

    return Promise.resolve({ result: true, data: null });
  },
);

const deleteGuestCartItem = vi.fn(
  ({ productVariantId }: DeleteGuestCartItemReq) => {
    serverCart = serverCart.filter(
      (item) => item.productVariantId !== productVariantId,
    );

    return Promise.resolve(undefined);
  },
);

const deleteGuestCart = vi.fn((guestId: string) => {
  // 호출 인자(guestId) 자체는 이 mock 에서 검증하지 않는다 — 누가 불렀는지는
  // `expectRemoveAllCalledOnce` 가 `toHaveBeenCalledWith` 로 따로 짚는다.
  void guestId;
  serverCart = [];

  return Promise.resolve(undefined);
});

/** ky 의 HTTPError 와 같은 모양 — `getErrorInfo` 는 response.status 만 본다. */
class FakeHTTPError extends Error {
  name = "HTTPError";
  constructor(public response: { status: number; url: string }) {
    super(`Request failed with status code ${response.status}`);
  }
}

const conflict = () =>
  Promise.reject(new FakeHTTPError({ status: 409, url: "https://api/cart" }));

vi.mock("@shared/services/userCart", () => ({
  createUserCartItems: (req: CreateUserCartItemsReq) =>
    createUserCartItems(req),
  updateUserCartItem: (req: UpdateUserCartItemReq) => updateUserCartItem(req),
  deleteUserCartItems: (ids?: number[]) => deleteUserCartItems(ids),
  deleteUserCartItem: vi.fn(),
  getUserCart: () => getUserCart(),
  getUserCartCount: vi.fn(),
}));

vi.mock("@shared/services/guestCart", () => ({
  createGuestCartItems: (req: CreateGuestCartItemsReq) =>
    createGuestCartItems(req),
  getGuestCart: () => getGuestCart(),
  getGuestCartCount: () =>
    Promise.resolve({ result: true, data: { count: serverCart.length } }),
  updateGuestCartItem: (req: UpdateGuestCartItemReq) =>
    updateGuestCartItem(req),
  deleteGuestCartItem: (req: DeleteGuestCartItemReq) =>
    deleteGuestCartItem(req),
  deleteGuestCart: (guestId: string) => deleteGuestCart(guestId),
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

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="ko" messages={messages}>
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );

  return renderHook(() => useCart(), { wrapper });
};

/** 첫 조회가 끝나 화면이 서버 값을 들고 있는 상태까지 기다린다 */
const setupLoaded = async () => {
  const rendered = setup();
  await waitFor(() => expect(rendered.result.current.isPending).toBe(false));

  return rendered;
};

const items = (result: { current: ReturnType<typeof useCart> }) =>
  result.current.brandGroups.flatMap((group) => group.items);

/** 실제 400ms 디바운스를 넘어서는 타이밍을 재현하려면 진짜 시간이 흘러야 한다. */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  nextCartItemId = 0;
  serverCart = [];
  getUserCart.mockClear();
  createUserCartItems.mockClear();
  updateUserCartItem.mockClear();
  deleteUserCartItems.mockClear();
  getGuestCart.mockClear();
  createGuestCartItems.mockClear();
  updateGuestCartItem.mockClear();
  deleteGuestCartItem.mockClear();
  deleteGuestCart.mockClear();
});

describe.each([
  {
    name: "회원",
    setup: () => {
      useUserAuthStore.setState({
        isAuthenticated: true,
        id: 1,
        hasHydrated: true,
      });
      useGuestCartIdStore.setState({ guestId: null, hasHydrated: true });
    },
  },
  {
    name: "게스트",
    setup: () => {
      useUserAuthStore.setState({
        isAuthenticated: false,
        id: 0,
        hasHydrated: true,
      });
      useGuestCartIdStore.setState({ guestId: "g-1", hasHydrated: true });
    },
  },
])("useCart ($name)", ({ name, setup: setupSource }) => {
  const isGuest = name === "게스트";

  beforeEach(() => {
    setupSource();
  });

  // 아래 헬퍼들이 이 스위트의 핵심이다 — 두 소스가 같은 시나리오를 돌리되, 서버로 나가는
  // mock 과 그 호출 모양(회원은 cartItemId, 게스트는 guestId + productVariantId)만 갈라
  // 짚는다. 어느 쪽이든 실제로 호출되는 mock 을 직접 단언해야 "두 어댑터가 서로 바꿔
  // 끼울 수 있다"는 사실이 검증된다.
  const createSpy = () =>
    isGuest ? createGuestCartItems : createUserCartItems;
  const updateSpy = () => (isGuest ? updateGuestCartItem : updateUserCartItem);
  const removeSpy = () => (isGuest ? deleteGuestCartItem : deleteUserCartItems);
  const listSpy = () => (isGuest ? getGuestCart : getUserCart);

  /** 담기 요청 검증. 게스트는 이미 발급된 guestId 를 함께 보낸다 */
  const expectCreateCalledWith = (
    expectedItems: ReadonlyArray<{
      productVariantId: number;
      quantity: number;
    }>,
  ) => {
    if (isGuest) {
      expect(createGuestCartItems).toHaveBeenCalledWith({
        guestId: "g-1",
        items: expectedItems,
      });
    } else {
      expect(createUserCartItems).toHaveBeenCalledWith({
        items: expectedItems,
      });
    }
  };

  /**
   * 수량 변경 요청 검증. 회원은 `cartItemId` 로 짚고, 게스트에는 그 값이 없으므로
   * `productVariantId`(SKU) 로 짚는다 — 원래 `cartItemId` 를 직접 단언하던 자리를
   * 게스트에서도 의미가 있는 값으로 바꾼 것이다.
   */
  const expectUpdateCalledWith = (
    line: { cartItemId: number | null; productVariantId: number },
    quantity: number,
  ) => {
    if (isGuest) {
      expect(updateGuestCartItem).toHaveBeenCalledWith({
        guestId: "g-1",
        productVariantId: line.productVariantId,
        quantity,
      });
    } else {
      expect(updateUserCartItem).toHaveBeenCalledWith({
        cartItemId: line.cartItemId,
        quantity,
      });
    }
  };

  /**
   * 선택 삭제 요청 검증. 회원은 `cartItemId` 배열로 한 번에, 게스트는 SKU 별로 각각
   * 부른다 — 서버 API 모양 자체가 다르므로(회원: 벌크, 게스트: 라인당 호출) 호출 형태도
   * 함께 갈라 짚는다.
   */
  const expectRemoveCalledWithLines = (
    lines: ReadonlyArray<{
      cartItemId: number | null;
      productVariantId: number;
    }>,
  ) => {
    if (isGuest) {
      lines.forEach((line) =>
        expect(deleteGuestCartItem).toHaveBeenCalledWith({
          guestId: "g-1",
          productVariantId: line.productVariantId,
        }),
      );
    } else {
      expect(deleteUserCartItems).toHaveBeenCalledWith(
        lines.map((line) => line.cartItemId),
      );
    }
  };

  /** 전체 비우기 검증. 회원은 ids 없이, 게스트는 guestId 로 한 번만 부른다 */
  const expectRemoveAllCalledOnce = () => {
    if (isGuest) {
      expect(deleteGuestCart).toHaveBeenCalledTimes(1);
      expect(deleteGuestCart).toHaveBeenCalledWith("g-1");
    } else {
      expect(deleteUserCartItems).toHaveBeenCalledTimes(1);
      expect(deleteUserCartItems).toHaveBeenCalledWith(undefined);
    }
  };

  describe("담기", () => {
    it("고른 SKU 와 수량만 서버로 보낸다", async () => {
      const { result } = await setupLoaded();

      await act(async () => {
        await expect(
          result.current.addItems([{ productVariantId: 501, quantity: 2 }]),
        ).resolves.toEqual({ status: "added" });
      });

      expectCreateCalledWith([{ productVariantId: 501, quantity: 2 }]);
    });

    // SKU 를 모르면 서버 장바구니에 담을 방법이 없다. 예전처럼 로컬에 남겨두지 않는다.
    it("productVariantId 가 없으면 아무것도 담지 않는다", async () => {
      const { result } = await setupLoaded();

      await act(async () => {
        await expect(
          result.current.addItems([
            { productVariantId: 501, quantity: 1 },
            { quantity: 1 },
          ]),
        ).resolves.toEqual({ status: "invalid" });
      });

      expect(createSpy()).not.toHaveBeenCalled();
    });

    it("재고 부족(409)이면 서버를 다시 읽고 stock 을 돌려준다", async () => {
      const { result } = await setupLoaded();
      const readsBefore = listSpy().mock.calls.length;

      createSpy().mockImplementationOnce(conflict);

      await act(async () => {
        await expect(
          result.current.addItems([{ productVariantId: 501, quantity: 99 }]),
        ).resolves.toEqual({ status: "stock" });
      });

      expect(listSpy().mock.calls.length).toBeGreaterThan(readsBefore);
    });
  });

  describe("수량 변경", () => {
    it("화면은 즉시 바뀌고 전송은 모아서 한 번만 한다", async () => {
      serverCart = [cartItem(501, 1)];
      const { result, rerender } = await setupLoaded();
      const [line] = items(result);

      // 두 클릭 사이에 실제로 렌더가 한 번 끼어들어야 한다 — 어댑터가 매 렌더 새
      // 객체이므로, 렌더 없이 한 act 안에서 두 번 부르면 디바운스 인스턴스가 안정적인지
      // 확인할 수 없다(회귀를 놓친다).
      act(() => {
        result.current.updateQuantity(line.productVariantId, 2);
      });
      rerender();
      act(() => {
        result.current.updateQuantity(line.productVariantId, 3);
      });

      // 전송 전에 이미 화면이 움직여 있어야 스테퍼가 굳어 보이지 않는다.
      await waitFor(() => expect(items(result)[0].quantity).toBe(3));
      expect(items(result)[0].totalPrice).toBe(3000);
      expect(updateSpy()).not.toHaveBeenCalled();

      await waitFor(() => expect(updateSpy()).toHaveBeenCalledTimes(1));
      expectUpdateCalledWith(line, 3);
    });

    it("재고 부족(409)이면 서버를 다시 읽어 정정한다", async () => {
      serverCart = [cartItem(501, 1)];
      const { result } = await setupLoaded();
      const [line] = items(result);

      updateSpy().mockImplementationOnce(conflict);

      act(() => {
        result.current.updateQuantity(line.productVariantId, 9);
      });

      await waitFor(() => expect(updateSpy()).toHaveBeenCalledTimes(1));
      // 서버는 1 을 그대로 들고 있다. 재조회가 화면을 그 값으로 되돌린다.
      await waitFor(() => expect(items(result)[0].quantity).toBe(1));
    });

    // 회귀 방지: 어댑터(`useMemberCart`/`useGuestCart`)는 매 렌더 새 객체를 돌려준다.
    // `flushQuantities` 가 그 객체 자체(`cart`)에 의존하면 렌더마다 새 디바운스 인스턴스가
    // 생겨 각자 독립된 타이머를 갖는다 — 클릭이 400ms 를 넘겨 이어지면(스테퍼를 계속
    // 누르는 상황) 예전 인스턴스의 타이머가 중간에 먼저 끝나 중간 수량을 서버로 흘리고,
    // 마지막 클릭도 한 박자 뒤에 따로 한 번 더 보낸다. 안정된 디바운스라면 매 클릭이
    // 같은 타이머를 리셋해 마지막 클릭 뒤 400ms 에 딱 한 번만 보낸다.
    it("400ms 를 넘겨 계속 클릭해도 마지막 값만 한 번 보낸다", async () => {
      serverCart = [cartItem(501, 1)];
      const { result, rerender } = await setupLoaded();
      const [line] = items(result);

      const click = (quantity: number) => {
        act(() => {
          result.current.updateQuantity(line.productVariantId, quantity);
        });
        // 어댑터를 다시 부르게 해 렌더 사이 디바운스 인스턴스가 바뀌는 조건을
        // 실제로 만든다.
        rerender();
      };

      // 150ms 간격 4클릭 = 총 450ms. 각 간격은 400ms 디바운스보다 짧아 계속 리셋돼야
      // 하지만, 첫 클릭부터 마지막 클릭까지의 전체 구간은 400ms 를 넘는다 — 렌더마다
      // 새 타이머가 생기는 회귀라면 이 지점에서 드러난다.
      click(2);
      await sleep(150);
      click(3);
      await sleep(150);
      click(4);
      await sleep(150);
      click(5);

      // 마지막 클릭 뒤 400ms 가 되기 전에는 아직 아무것도 보내지 않아야 한다 — 이전
      // 클릭의 타이머가 먼저 끝나 버리면 여기서 이미 호출이 잡힌다.
      await sleep(200);
      expect(updateSpy()).not.toHaveBeenCalled();

      await waitFor(() => expect(updateSpy()).toHaveBeenCalledTimes(1));
      expectUpdateCalledWith(line, 5);
    });
  });

  describe("삭제", () => {
    it("고른 라인만 즉시 사라지고 한 번에 지운다", async () => {
      serverCart = [cartItem(501), cartItem(502)];
      const { result } = await setupLoaded();
      const [first] = items(result);

      act(() => {
        result.current.removeItems([first.productVariantId]);
      });

      // 서버 응답을 기다리지 않고 먼저 사라진다(회원은 낙관적 캐시 수정, 게스트는
      // 삭제 뒤 무효화로 인한 재조회 — 어느 쪽이든 화면에서 사라지는 결과는 같다).
      await waitFor(() => expect(items(result)).toHaveLength(1));
      expectRemoveCalledWithLines([first]);
    });

    // 회귀 방지: 빈 인자로 부르면 서버가 장바구니를 통째로 비운다.
    it("지울 것이 없으면 호출하지 않는다", async () => {
      serverCart = [cartItem(501)];
      const { result } = await setupLoaded();

      act(() => {
        result.current.removeItems([]);
      });

      expect(removeSpy()).not.toHaveBeenCalled();
    });

    // `removeAll` 은 화면의 id 목록을 모으지 않고 ids 없이 한 번만 호출한다 — 서버
    // 장바구니 전체를 비우는 요청이라, 선택 삭제와는 다른 서버 호출 모양이다.
    it("전체 비우기는 ids 없이 한 번만 호출하고 목록을 낙관적으로 비운다", async () => {
      serverCart = [cartItem(501), cartItem(502)];
      const { result } = await setupLoaded();
      expect(items(result)).toHaveLength(2);

      act(() => {
        result.current.removeAll();
      });

      // 서버 응답을 기다리지 않고 먼저 비워진다.
      await waitFor(() => expect(items(result)).toHaveLength(0));
      expectRemoveAllCalledOnce();
    });
  });

  describe("되돌리기", () => {
    it("지웠던 SKU 를 같은 수량으로 다시 담는다", async () => {
      serverCart = [cartItem(501, 3)];
      const { result } = await setupLoaded();
      const [line] = items(result);

      act(() => {
        result.current.removeItems([line.productVariantId]);
      });
      await waitFor(() => expect(removeSpy()).toHaveBeenCalled());

      await act(async () => {
        await result.current.restoreItems([line]);
      });

      expectCreateCalledWith([{ productVariantId: 501, quantity: 3 }]);
    });
  });
});
