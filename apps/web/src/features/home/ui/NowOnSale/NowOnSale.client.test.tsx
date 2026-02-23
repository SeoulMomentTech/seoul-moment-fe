import { describe, expect, it, vi } from "vitest";

import type { ProductItem } from "@/shared/services/product";

import { render, screen } from "@testing-library/react";

import { NowOnSaleContents } from "./NowOnSale.client";

// Mocks
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@entities/product", () => ({
  ProductCard: ({ data }: { data: ProductItem }) => (
    <div data-testid="product-card">{data.productName}</div>
  ),
}));

vi.mock("@widgets/empty", () => ({
  Empty: ({
    description,
    icon,
  }: {
    description: string;
    icon: React.ReactNode;
  }) => (
    <div data-testid="empty-state">
      {icon}
      <span>{description}</span>
    </div>
  ),
}));

vi.mock("@seoul-moment/ui", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

describe("NowOnSaleContents", () => {
  it("renders empty state when data is empty", () => {
    // given
    const data: ProductItem[] = [];

    // when
    render(<NowOnSaleContents data={data} />);

    // then
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.queryByTestId("product-card")).not.toBeInTheDocument();
  });

  it("renders product list when data is provided", () => {
    // given
    const data: ProductItem[] = [
      {
        id: 1,
        brandName: "Brand 1",
        productName: "Product 1",
        price: 1000,
        like: 0,
        review: 0,
        reviewAverage: 0,
        image: "img1",
        colorName: "Red",
        colorCode: "#FF0000",
      },
    ];

    // when
    render(<NowOnSaleContents data={data} />);

    // then
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByTestId("product-card")).toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("더보기")).toBeInTheDocument();
  });
});
