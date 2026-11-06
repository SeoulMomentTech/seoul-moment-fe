import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { UserOrderPreviewBrandGroup } from "@shared/services/userOrder";

import ko from "@/i18n/messages/ko.json";

import type { OrderSource } from "@entities/order";
import { render, screen } from "@testing-library/react";

import { OrderStockShortage } from "./OrderStockShortage";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={`/ko${href}`}>{children}</a>
  ),
}));

const groups = [
  {
    brandId: 1,
    brandName: "MUCENT",
    items: [
      {
        cartItemId: 12,
        productItemId: 7,
        productVariantId: 101,
        productName: "크롭 후드 집업",
        optionText: "베이지 / FREE",
        imageUrl: "",
        price: 1100,
        quantity: 1,
        totalPrice: 1100,
        stockQuantity: 0,
        isSoldOut: false,
        isAvailable: true,
      },
    ],
  },
] as unknown as UserOrderPreviewBrandGroup[];

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="ko" messages={ko}>
    {children}
  </NextIntlClientProvider>
);

describe("OrderStockShortage", () => {
  it("부족한 라인의 상품명·옵션과 장바구니 링크를 그린다", () => {
    const source: OrderSource = { type: "cart", cartItemIds: [12] };

    render(
      <OrderStockShortage
        groups={groups}
        shortage={{ productVariantIds: [101] }}
        source={source}
      />,
      { wrapper },
    );

    expect(
      screen.getByText(ko.payment_stock_shortage_title),
    ).toBeInTheDocument();
    expect(
      screen.getByText("크롭 후드 집업 (베이지 / FREE)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(ko.payment_stock_shortage_hint),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: new RegExp(ko.go_to_cart) }),
    ).toHaveAttribute("href", "/ko/cart");
  });

  it("바로 구매면 상품 페이지 링크다", () => {
    const source: OrderSource = {
      type: "direct",
      items: [{ productVariantId: 101, quantity: 1 }],
    };

    render(
      <OrderStockShortage
        groups={groups}
        shortage={{ productVariantIds: [101] }}
        source={source}
      />,
      { wrapper },
    );

    expect(
      screen.getByRole("link", { name: new RegExp(ko.payment_go_to_product) }),
    ).toHaveAttribute("href", "/ko/product/7");
  });

  it("라인을 못 찾으면 상품명 없이 문구만 그린다", () => {
    const source: OrderSource = { type: "cart", cartItemIds: [12] };

    render(
      <OrderStockShortage
        groups={groups}
        shortage={{ productVariantIds: [999] }}
        source={source}
      />,
      { wrapper },
    );

    expect(
      screen.getByText(ko.payment_stock_shortage_title),
    ).toBeInTheDocument();
    expect(screen.queryByText(/크롭 후드 집업/)).not.toBeInTheDocument();
  });
});
