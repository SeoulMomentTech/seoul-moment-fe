import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

// 배럴은 `useCartStore` 를 노출하지 않는다(UI 가 스토어를 직접 못 쓰게 하는 경계).
// 테스트는 UI 가 아니므로 깊은 경로로 가져와 경계를 그대로 둔다.
import { useCartStore } from "@entities/cart/model/useCartStore";
import type {
  GetProductDetailRes,
  OptionValue,
} from "@shared/services/product";

import messages from "@/i18n/messages/ko.json";

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

vi.mock("@shared/lib/hooks/useUserAuthStore", () => ({
  useUserAuthStore: (
    selector: (state: { isAuthenticated: boolean }) => unknown,
  ) => selector({ isAuthenticated: true }),
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const value = (id: number, v: string): OptionValue => ({ id, value: v });

const product = (option: GetProductDetailRes["option"]): GetProductDetailRes =>
  ({
    id: 132,
    name: "무브 쇼츠",
    brand: { id: "b1", name: "OSSMOVE", profileImg: "" },
    price: 1600,
    discountPrice: 1530,
    origin: "중국",
    shippingInfo: 7,
    shippingCost: 70,
    option,
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
  <NextIntlClientProvider locale="ko" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

const setup = (option: GetProductDetailRes["option"]) =>
  renderHook(() => useAddToCartDraft({ product: product(option) }), {
    wrapper,
  });

beforeEach(() => {
  useCartStore.setState({ lines: [], ownerId: 0 });
});

describe("선택형 — 값이 2개 이상인 축이 있는 상품", () => {
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

  it("담기 1회로 조합 전체가 장바구니에 들어간다", () => {
    const { result } = setup(clothing);

    act(() => result.current.pickAxis("SIZE", 10));
    act(() => result.current.pickAxis("MATERIAL", 20));
    act(() => result.current.pickAxis("SIZE", 11));

    let ok = false;
    act(() => {
      ok = result.current.submit();
    });

    expect(ok).toBe(true);
    expect(useCartStore.getState().lines).toHaveLength(2);
    expect(useCartStore.getState().lines[0].imageUrl).toBe(
      "https://example.com/a.jpg",
    );
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
