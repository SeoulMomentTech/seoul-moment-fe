import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/i18n/messages/ko.json";

import type { UserCartBrandGroup, UserCartItem } from "@entities/cart";
import { fireEvent, render, screen } from "@testing-library/react";

import { CartBrandGroupSection } from "./CartBrandGroup";

// CartLineRow 가 끌고 오는 것들. 그리기만 하면 되므로 가장 얇게 끊는다.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("next/image", () => ({ default: () => null }));

let nextCartItemId = 0;

const cartItem = (overrides: Partial<UserCartItem> = {}): UserCartItem => {
  nextCartItemId += 1;

  return {
    cartItemId: nextCartItemId,
    productItemId: 1,
    productVariantId: nextCartItemId,
    productName: `상품 ${nextCartItemId}`,
    optionText: "IVORY / M",
    imageUrl: "",
    price: 1000,
    discountPrice: 0,
    quantity: 1,
    totalPrice: 1000,
    stockQuantity: 50,
    isSoldOut: false,
    isAvailable: true,
    ...overrides,
  };
};

const BRAND_NAME = "OSSMOVE";

const brandGroup = (items: UserCartItem[]): UserCartBrandGroup => ({
  brandId: 1,
  brandName: BRAND_NAME,
  brandProfileImage: "",
  items,
  productAmount: items.reduce((total, item) => total + item.totalPrice, 0),
});

const renderGroup = (
  items: UserCartItem[],
  selectedCartItemIds: ReadonlySet<number>,
  onToggleGroup = vi.fn(),
) => {
  render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      <CartBrandGroupSection
        group={brandGroup(items)}
        onQuantityChange={vi.fn()}
        onRemove={vi.fn()}
        onToggleGroup={onToggleGroup}
        onToggleLine={vi.fn()}
        selectedCartItemIds={selectedCartItemIds}
      />
    </NextIntlClientProvider>,
  );

  return {
    brandCheckbox: screen.getByRole<HTMLInputElement>("checkbox", {
      name: BRAND_NAME,
    }),
    onToggleGroup,
  };
};

beforeEach(() => {
  nextCartItemId = 0;
});

describe("브랜드 체크박스", () => {
  /**
   * 회귀 방지: 품절 라인은 `useCartSelection` 이 선택 대상에서 빼므로 `selectedCartItemIds`
   * 에 절대 들어오지 않는다. 그룹이 전체 라인으로 세면 이 브랜드는 전체 선택이 영원히
   * 완료되지 않아 체크박스가 중간 상태로 굳는다.
   */
  it("품절 라인이 끼어 있어도 나머지를 다 고르면 체크된다", () => {
    const available = cartItem();
    const soldOut = cartItem({ isSoldOut: true });

    const { brandCheckbox } = renderGroup(
      [available, soldOut],
      new Set([available.cartItemId]),
    );

    expect(brandCheckbox.checked).toBe(true);
    expect(brandCheckbox.indeterminate).toBe(false);
  });

  it("고를 수 있는 라인 중 일부만 골랐으면 중간 상태다", () => {
    const first = cartItem();
    const second = cartItem();
    const soldOut = cartItem({ isSoldOut: true });

    const { brandCheckbox } = renderGroup(
      [first, second, soldOut],
      new Set([first.cartItemId]),
    );

    expect(brandCheckbox.checked).toBe(false);
    expect(brandCheckbox.indeterminate).toBe(true);
  });

  // 품절 외의 사유(판매중지)도 서버가 `isAvailable: false` 로 알린다. 같은 취급이다.
  it("판매중지 라인도 전체 선택 기준에서 빠진다", () => {
    const available = cartItem();
    const unavailable = cartItem({ isAvailable: false });

    const { brandCheckbox } = renderGroup(
      [available, unavailable],
      new Set([available.cartItemId]),
    );

    expect(brandCheckbox.checked).toBe(true);
  });

  it("전부 품절인 브랜드는 누를 수 없다", () => {
    const { brandCheckbox } = renderGroup(
      [cartItem({ isSoldOut: true }), cartItem({ isSoldOut: true })],
      new Set(),
    );

    expect(brandCheckbox.disabled).toBe(true);
    expect(brandCheckbox.checked).toBe(false);
    expect(brandCheckbox.indeterminate).toBe(false);
  });

  it("전체 선택은 고를 수 있는 라인만 넘긴다", () => {
    const available = cartItem();
    const soldOut = cartItem({ isSoldOut: true });

    const { brandCheckbox, onToggleGroup } = renderGroup(
      [available, soldOut],
      new Set(),
    );

    fireEvent.click(brandCheckbox);

    expect(onToggleGroup).toHaveBeenCalledWith([available.cartItemId], true);
  });
});
