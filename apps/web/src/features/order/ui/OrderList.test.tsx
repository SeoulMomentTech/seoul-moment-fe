import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import ko from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import { OrderList } from "./OrderList";

const getUserOrderList = vi.fn();
vi.mock("@shared/services/userOrder", async (importOriginal) => ({
  ...(await importOriginal<typeof UserOrderService>()),
  getUserOrderList: (req: unknown) => getUserOrderList(req),
}));

// eslint-disable-next-line import/order
import type * as UserOrderService from "@shared/services/userOrder";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={`/ko${href}`}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

const order = (id: number, extra: object = {}) => ({
  orderId: id,
  orderNumber: `SM-20261124-0000${id}`,
  orderedAt: "2026-11-24T10:28:00Z",
  status: "PAID",
  statusLabel: "결제 완료",
  deliveryStage: "PREPARING_ORDER",
  deliveryStageLabel: "상품 준비 중",
  deliveryStep: 2,
  totalAmount: 2770,
  internationalDiscount: 0,
  representativeProductName: "무브 쇼츠",
  representativeImageUrl: null,
  representativeOptionText: "레드 / S",
  itemCount: 2,
  ...extra,
});

const page = (list: object[], total: number) => ({
  result: true,
  data: { list, total },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <NextIntlClientProvider locale="ko" messages={ko}>
      {children}
    </NextIntlClientProvider>
  </QueryClientProvider>
);

describe("OrderList", () => {
  beforeEach(() => {
    useUserAuthStore.setState({ id: 1, isAuthenticated: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("주문 카드를 그리고 상세로 연결한다 — 대표 상품·외 N건·배지·진행바", async () => {
    getUserOrderList.mockResolvedValue(page([order(27)], 1));

    render(<OrderList />, { wrapper });

    const link = await screen.findByRole("link", { name: /무브 쇼츠/ });
    expect(link).toHaveAttribute("href", "/ko/mypage/order/27");
    expect(screen.getByText("외 1건")).toBeInTheDocument();
    expect(screen.getByText("결제 완료")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "상품 준비 중" }),
    ).toBeInTheDocument();
  });

  it("취소된 주문은 진행바 없이 배지만 그린다", async () => {
    getUserOrderList.mockResolvedValue(
      page([order(26, { status: "CANCELED", statusLabel: "주문 취소" })], 1),
    );

    render(<OrderList />, { wrapper });

    expect(await screen.findByText("주문 취소")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("더 받을 주문이 있으면 더보기로 다음 페이지를 부른다", async () => {
    getUserOrderList
      .mockResolvedValueOnce(page([order(1)], 2))
      .mockResolvedValueOnce(page([order(2)], 2));

    render(<OrderList />, { wrapper });

    fireEvent.click(await screen.findByRole("button", { name: ko.more }));

    expect(
      await screen.findByRole("link", { name: /SM-20261124-00002/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: new RegExp(ko.more) }),
    ).toBeNull();
    expect(getUserOrderList).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, status: "ALL", months: 3 }),
    );
  });

  it("주문이 없으면 빈 상태와 쇼핑 계속하기를 보여준다", async () => {
    getUserOrderList.mockResolvedValue(page([], 0));

    render(<OrderList />, { wrapper });

    expect(await screen.findByText(ko.order_list_empty)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: ko.payment_continue_shopping }),
    ).toHaveAttribute("href", "/ko/");
  });

  it("목록을 못 불러오면 오류 문구를 보여준다", async () => {
    getUserOrderList.mockRejectedValue(new Error("boom"));

    render(<OrderList />, { wrapper });

    expect(await screen.findByText(ko.order_list_error)).toBeInTheDocument();
  });

  it("상태 탭을 바꾸면 그 상태로 다시 부른다", async () => {
    getUserOrderList.mockResolvedValue(page([order(27)], 1));

    render(<OrderList />, { wrapper });
    await screen.findByText("결제 완료");

    fireEvent.click(
      screen.getByRole("tab", { name: ko.order_filter_canceled }),
    );

    await screen.findByRole("tab", {
      name: ko.order_filter_canceled,
      selected: true,
    });
    expect(getUserOrderList).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: "CANCELED", page: 1 }),
    );
  });
});
