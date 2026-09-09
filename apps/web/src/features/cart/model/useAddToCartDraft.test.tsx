import type { ReactNode } from "react";

import type * as Ky from "ky";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  GetProductDetailRes,
  OptionValue,
} from "@shared/services/product";
import type { CreateUserCartItemReq } from "@shared/services/userCart";

import messages from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";

import { useAddToCartDraft } from "./useAddToCartDraft";

// entities/cart 배럴이 CartLineRow 를 끌고 오고, 그게 next-intl 의 navigation 을 통해
// next/navigation 을 ESM 으로 해석하려 해서 vitest 에서 실패한다. 체인을 끊는다.
vi.mock("@/i18n/navigation", () => ({
  Link: () => null,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

vi.mock("next/image", () => ({ default: () => null }));

// useCart 가 서버 정정을 위해 useLanguage(useParams) 를 탄다. 라우트 밖이라 null 이 온다.
vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

const authState = { isAuthenticated: true, id: 1 };

vi.mock("@shared/lib/hooks/useUserAuthStore", () => ({
  // `useUserCartQuery` 는 셀렉터 없이 부른다. 두 호출 방식을 모두 받아야 한다.
  useUserAuthStore: (selector?: (state: typeof authState) => unknown) =>
    selector ? selector(authState) : authState,
  useUserAuthHydrated: () => true,
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

// `getErrorInfo` 는 ky 의 isHTTPError 로 판별한다. name 이 "HTTPError" 면 통과시킨다.
vi.mock("ky", async (importOriginal) => ({
  ...(await importOriginal<typeof Ky>()),
  isHTTPError: (error: unknown) =>
    error instanceof Error && error.name === "HTTPError",
}));

const createUserCartItem = vi.fn((req: CreateUserCartItemReq) =>
  Promise.resolve({
    result: true,
    data: { cartItemId: req.productVariantId, totalCount: 1 },
  }),
);

vi.mock("@shared/services/userCart", () => ({
  // useMutation 은 mutationFn 에 (variables, context) 를 넘기므로 첫 인자만 스파이로 흘린다.
  createUserCartItem: (req: CreateUserCartItemReq) => createUserCartItem(req),
  getUserCart: () =>
    Promise.resolve({
      result: true,
      data: { brandGroups: [], totalCount: 0 },
    }),
  getUserCartCount: vi.fn(),
  updateUserCartItem: vi.fn(),
  deleteUserCartItem: vi.fn(),
  deleteUserCartItems: vi.fn(),
}));

const value = (id: number, v: string): OptionValue => ({ id, value: v });

const variant = (id: number, optionValueIds: number[]) => ({
  id,
  sku: `SKU-${id}`,
  optionValueIds,
  stockQuantity: 10,
  isSoldOut: false,
});

const product = (
  option: GetProductDetailRes["option"],
  variants: GetProductDetailRes["variants"] = [],
): GetProductDetailRes =>
  ({
    id: 132,
    name: "무브 쇼츠",
    brand: { id: 1, name: "OSSMOVE", profileImg: "" },
    price: 1600,
    discountPrice: 1530,
    origin: "중국",
    shippingInfo: 7,
    option,
    variants,
    like: 0,
    review: 0,
    reviewAverage: 0,
    detailImg: "",
    subImage: ["https://example.com/a.jpg"],
    relate: [],
    external: [],
    isLiked: false,
  }) as GetProductDetailRes;

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

const setup = (
  option: GetProductDetailRes["option"],
  variants?: GetProductDetailRes["variants"],
) =>
  renderHook(() => useAddToCartDraft({ product: product(option, variants) }), {
    wrapper,
  });

beforeEach(() => {
  createUserCartItem.mockClear();
});

describe("선택형 — variants 를 못 받은, 값이 2개 이상인 축이 있는 상품", () => {
  const clothing: GetProductDetailRes["option"] = {
    COLOR: [value(1, "레드")],
    SIZE: [value(10, "S"), value(11, "M")],
    MATERIAL: [value(20, "폴리에스터"), value(21, "스판덱스")],
  };

  it("선택필요 축만 selectbox 로 노출하고 값 1개인 축은 자동 확정한다", () => {
    const { result } = setup(clothing);

    expect(result.current.mode).toBe("selectable");
    expect(result.current.selectableAxes.map((a) => a.type)).toEqual([
      "SIZE",
      "MATERIAL",
    ]);
    expect(result.current.fixedAxes.map((a) => a.type)).toEqual(["COLOR"]);
  });

  it("축을 전부 골라야 조합이 생긴다", () => {
    const { result } = setup(clothing);

    act(() => result.current.pickAxis("SIZE", 10));
    expect(result.current.lines).toHaveLength(0);
    expect(result.current.canSubmit).toBe(false);

    act(() => result.current.pickAxis("MATERIAL", 20));
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.canSubmit).toBe(true);
  });

  it("자동 확정 축 값도 조합 라벨에 포함된다", () => {
    const { result } = setup(clothing);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));

    expect(result.current.lines[0].options.map((o) => o.value)).toEqual([
      "레드",
      "S",
      "폴리에스터",
    ]);
  });

  // 회귀 방지: 조합 완성 후 선택을 리셋하면 Radix Select 의 controlled value 만
  // 비워져 같은 값을 다시 골라도 onValueChange 가 오지 않아 두 번째 조합을 못 만든다.
  it("축 하나만 바꾸면 두 번째 조합이 바로 쌓인다", () => {
    const { result } = setup(clothing);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));
    act(() => result.current.pickAxis("SIZE", 11));

    expect(result.current.lines).toHaveLength(2);
    expect(result.current.lines.map((l) => l.options.at(-2)?.value)).toEqual([
      "S",
      "M",
    ]);
    expect(result.current.totalAmount).toBe(1530 * 2);
  });

  it("선택을 리셋하지 않으므로 고른 값이 유지된다", () => {
    const { result } = setup(clothing);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));

    expect(result.current.picked).toEqual({ SIZE: 10, MATERIAL: 20 });
  });

  it("같은 조합을 다시 만들면 새 줄이 아니라 수량 +1", () => {
    const { result } = setup(clothing);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));
    act(() => result.current.pickAxis("MATERIAL", 21));
    act(() => result.current.pickAxis("MATERIAL", 20));

    expect(result.current.lines).toHaveLength(2);
    expect(result.current.lines[0].quantity).toBe(2);
  });

  it("조합을 지울 수 있고 0개가 되면 담을 수 없다", () => {
    const { result } = setup(clothing);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));
    act(() => result.current.removeLine(result.current.lines[0].key));

    expect(result.current.lines).toHaveLength(0);
    expect(result.current.canSubmit).toBe(false);
  });

  // 서버 장바구니는 SKU 단위라 고른 조합을 variant 로 번역해 보낸다.
  it("담기 1회로 조합마다 한 번씩 서버에 담는다", async () => {
    const { result } = setup(clothing, [
      variant(101, [1, 10, 20]),
      variant(102, [1, 11, 20]),
    ]);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));
    act(() => result.current.pickAxis("SIZE", 11));

    let ok = false;
    // mutate 는 mutationFn 을 마이크로태스크에서 호출하므로 flush 가 필요하다.
    await act(async () => {
      ok = await result.current.submit();
    });

    expect(ok).toBe(true);
    expect(createUserCartItem.mock.calls.map(([req]) => req)).toEqual([
      { productVariantId: 101, quantity: 1 },
      { productVariantId: 102, quantity: 1 },
    ]);
  });

  // 서버 장바구니가 유일한 저장소라 SKU 를 못 정하면 담을 방법이 없다.
  // 예전에는 로컬에만 남겼지만 이제는 실패로 끝낸다.
  it("variants 가 없으면 아무것도 담지 않고 실패로 끝낸다", async () => {
    const { result } = setup(clothing);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));

    let ok = true;
    await act(async () => {
      ok = await result.current.submit();
    });

    expect(ok).toBe(false);
    expect(createUserCartItem).not.toHaveBeenCalled();
  });

  it("고를수록 남은 조합이 없는 옵션값이 비활성 대상이 된다", () => {
    // 살아 있는 조합은 S+폴리에스터, M+스판덱스 뿐이다.
    const { result } = setup(clothing, [
      variant(101, [1, 10, 20]),
      variant(102, [1, 11, 21]),
    ]);

    // 아직 아무것도 안 골랐으면 네 값 모두 도달 가능하다.
    expect([...result.current.unavailableOptionValueIds]).toEqual([]);

    // S 를 고르면 스판덱스(21)로 갈 방법이 없어진다.
    act(() => result.current.pickAxis("SIZE", 10));
    expect([...result.current.unavailableOptionValueIds]).toEqual([21]);
  });

  it("품절된 조합의 옵션값은 처음부터 비활성 대상이다", () => {
    const { result } = setup(clothing, [
      { ...variant(101, [1, 10, 20]), isSoldOut: true },
      variant(102, [1, 11, 20]),
    ]);

    // S(10) 는 어떤 조합으로도 살 수 없다. 스판덱스(21)도 조합 자체가 없다.
    expect([...result.current.unavailableOptionValueIds].sort()).toEqual([
      10, 21,
    ]);
  });

  it("구매 가능한 조합이 없으면 조합을 쌓지 않는다", () => {
    const { result } = setup(clothing, [
      { ...variant(101, [1, 10, 20]), stockQuantity: 0 },
    ]);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));

    expect(result.current.lines).toHaveLength(0);
    expect(result.current.canSubmit).toBe(false);
  });
});

describe("조합형 — variants 를 받은 상품", () => {
  const clothing: GetProductDetailRes["option"] = {
    COLOR: [value(1, "레드")],
    SIZE: [value(10, "S"), value(11, "M")],
    MATERIAL: [value(20, "폴리에스터"), value(21, "스판덱스")],
  };

  it("축별 selectbox 대신 조합 하나짜리 드롭다운을 쓴다", () => {
    const { result } = setup(clothing, [
      variant(101, [1, 10, 20]),
      variant(102, [1, 11, 21]),
    ]);

    expect(result.current.selectMode).toBe("variant");
    expect(result.current.variantChoices.map((c) => c.label)).toEqual([
      "레드 / S / 폴리에스터",
      "레드 / M / 스판덱스",
    ]);
  });

  // 서버 현재 응답 형태: 상품당 조합 1개 + 한 축(소재)에 값 여러 개.
  it("한 축에 값이 여러 개인 합집합 응답도 조합 드롭다운으로 보여준다", () => {
    const { result } = setup(clothing, [variant(170, [1, 10, 20, 21])]);

    expect(result.current.selectMode).toBe("variant");
    expect(result.current.variantChoices.map((c) => c.label)).toEqual([
      "레드 / S / 폴리에스터·스판덱스",
    ]);
  });

  it("조합을 고르면 SKU 를 그대로 들고 라인이 쌓인다", () => {
    const { result } = setup(clothing, [
      variant(101, [1, 10, 20]),
      variant(102, [1, 11, 21]),
    ]);

    act(() => result.current.pickVariant(102));

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].variantId).toBe(102);
    expect(result.current.lines[0].label).toBe("레드 / M / 스판덱스");
    expect(result.current.canSubmit).toBe(true);
  });

  it("같은 조합을 다시 고르면 새 줄이 아니라 수량 +1", () => {
    const { result } = setup(clothing, [variant(101, [1, 10, 20])]);

    act(() => result.current.pickVariant(101));
    act(() => result.current.pickVariant(101));

    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].quantity).toBe(2);
  });

  it("품절 조합은 라인을 만들지 않는다", () => {
    const { result } = setup(clothing, [
      { ...variant(101, [1, 10, 20]), isSoldOut: true },
    ]);

    expect(result.current.variantChoices[0].isPurchasable).toBe(false);

    act(() => result.current.pickVariant(101));

    expect(result.current.lines).toHaveLength(0);
  });

  // 고른 조합이 곧 SKU 라 담을 때 역으로 찾을 필요가 없다.
  it("고른 SKU 로 서버에도 담는다", async () => {
    const { result } = setup(clothing, [
      variant(101, [1, 10, 20]),
      variant(102, [1, 11, 21]),
    ]);

    act(() => result.current.pickVariant(101));
    act(() => result.current.pickVariant(102));

    await act(async () => {
      await result.current.submit();
    });

    expect(createUserCartItem.mock.calls.map(([req]) => req)).toEqual([
      { productVariantId: 101, quantity: 1 },
      { productVariantId: 102, quantity: 1 },
    ]);
  });

  it("살 수 있는 조합이 하나라도 있으면 품절이 아니다", () => {
    const { result } = setup(clothing, [
      { ...variant(101, [1, 10, 20]), isSoldOut: true },
      variant(102, [1, 11, 21]),
    ]);

    expect(result.current.isSoldOut).toBe(false);
  });

  it("모든 조합이 품절이면 상품 전체가 품절이다", () => {
    const { result } = setup(clothing, [
      { ...variant(101, [1, 10, 20]), isSoldOut: true },
      { ...variant(102, [1, 11, 21]), stockQuantity: 0 },
    ]);

    expect(result.current.isSoldOut).toBe(true);
  });

  // 재고를 모르는 것과 없는 것은 다르다.
  it("variants 를 못 받은 상품은 품절로 보지 않는다", () => {
    const { result } = setup(clothing);

    expect(result.current.isSoldOut).toBe(false);
  });

  it("같은 조합을 재고보다 많이 고를 수 없다", () => {
    const { result } = setup(clothing, [
      { ...variant(101, [1, 10, 20]), stockQuantity: 2 },
    ]);

    act(() => result.current.pickVariant(101));
    act(() => result.current.pickVariant(101));
    act(() => result.current.pickVariant(101));

    expect(result.current.lines[0].stockQuantity).toBe(2);
    expect(result.current.lines[0].quantity).toBe(2);
  });

  it("수량을 직접 올려도 재고에서 멈춘다", () => {
    const { result } = setup(clothing, [
      { ...variant(101, [1, 10, 20]), stockQuantity: 2 },
    ]);

    act(() => result.current.pickVariant(101));
    act(() => result.current.setQuantity(result.current.lines[0].key, 9));

    expect(result.current.lines[0].quantity).toBe(2);
  });

  // 회귀 방지: 서버 응답을 기다리지 않으면 재고 부족으로 거부된 담기에도
  // "장바구니에 담았습니다" 가 뜬다.
  it("서버가 재고 부족으로 거부하면 담기를 성공으로 알리지 않는다", async () => {
    createUserCartItem.mockImplementationOnce(() =>
      Promise.reject(
        Object.assign(new Error("Request failed with status code 409"), {
          name: "HTTPError",
          response: { status: 409, url: "https://api/user/cart" },
        }),
      ),
    );

    const { result } = setup(clothing, [variant(101, [1, 10, 20])]);

    act(() => result.current.pickVariant(101));

    let ok = true;
    await act(async () => {
      ok = await result.current.submit();
    });

    expect(ok).toBe(false);
  });

  // 고를 축이 없는 상품이라도 조합이 있으면 드롭다운으로 고른다. 미리 쌓아두면
  // 사용자가 고른 조합과 키가 달라 같은 SKU 가 두 줄이 된다.
  it("값이 전부 1개인 상품도 조합을 받으면 미리 쌓아두지 않는다", () => {
    const { result } = setup({ VOLUME: [value(30, "50ml")] }, [
      variant(101, [30]),
    ]);

    expect(result.current.selectMode).toBe("variant");
    expect(result.current.lines).toHaveLength(0);
    expect(result.current.canRemoveLines).toBe(true);
  });
});

describe("고정형 — 값이 전부 1개인 상품 (화장품)", () => {
  const cosmetic: GetProductDetailRes["option"] = {
    VOLUME: [value(30, "50ml")],
    TEXTURE: [value(31, "젤 크림")],
  };

  it("selectbox 를 노출하지 않고 조합 1개로 시작한다", () => {
    const { result } = setup(cosmetic);

    expect(result.current.mode).toBe("fixed");
    expect(result.current.selectableAxes).toHaveLength(0);
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.canSubmit).toBe(true);
    expect(result.current.lines[0].options.map((o) => o.value)).toEqual([
      "50ml",
      "젤 크림",
    ]);
  });

  // 조합이 항상 1개라 지우면 되살릴 선택 UI 가 없다.
  it("조합을 지울 수 없다", () => {
    const { result } = setup(cosmetic);

    act(() => result.current.removeLine(result.current.lines[0].key));

    expect(result.current.lines).toHaveLength(1);
  });

  it("수량만 조작한다", () => {
    const { result } = setup(cosmetic);

    act(() => result.current.setQuantity(result.current.lines[0].key, 3));

    expect(result.current.lines[0].quantity).toBe(3);
    expect(result.current.totalAmount).toBe(1530 * 3);
  });
});

describe("옵션이 아예 없는 상품", () => {
  it("고정형으로 조합 1개를 만들고 옵션은 비어 있다", () => {
    const { result } = setup({} as GetProductDetailRes["option"]);

    expect(result.current.mode).toBe("fixed");
    expect(result.current.lines).toHaveLength(1);
    expect(result.current.lines[0].options).toEqual([]);
    expect(result.current.canSubmit).toBe(true);
  });
});
