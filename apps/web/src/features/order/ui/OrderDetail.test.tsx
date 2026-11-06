import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import ko from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { OrderDetail } from "./OrderDetail";

const getUserOrderDetail = vi.fn();
const postUserOrderPayment = vi.fn();
vi.mock("@shared/services/userOrder", async (importOriginal) => ({
  ...(await importOriginal<typeof UserOrderService>()),
  getUserOrderDetail: (id: number) => getUserOrderDetail(id),
  postUserOrderPayment: (req: unknown) => postUserOrderPayment(req),
}));

// eslint-disable-next-line import/order
import type * as UserOrderService from "@shared/services/userOrder";

vi.mock("../model/paymentWindow", () => ({
  openPaymentTab: () => null,
  openPaymentWindow: vi.fn().mockResolvedValue("same-tab"),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={`/ko${href}`}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

const base = {
  orderId: 481,
  orderNumber: "SM-20261106-000011",
  status: "PAID",
  paymentMethod: "ECPAY",
  totalProductAmount: 1470,
  shippingFee: 60,
  isRemoteIsland: false,
  freeShippingThreshold: 1500,
  totalAmount: 1530,
  orderedAt: "2026-11-06T07:05:00Z",
  paidAt: "2026-11-06T07:09:00Z",
  payment: {
    paymentId: 13,
    method: "ECPAY",
    status: "PAID",
    amount: 1530,
    pgPaymentType: "Credit_CreditCard",
    paidAt: "2026-11-06T07:09:00Z",
  },
  invoice: {
    type: "MOBILE_BARCODE",
    status: "ISSUED",
    carrierNum: "/ABC1234",
    invoiceNo: "LY74004967",
  },
  items: [
    {
      orderItemId: 1,
      productItemId: 10,
      brandId: 7,
      brandName: "MUCENT",
      productName: "크롭 가디건",
      optionText: "블랙 / FREE",
      imageUrl: "https://img/1.jpg",
      unitPrice: 1470,
      unitDiscountPrice: 1470,
      quantity: 1,
      totalPrice: 1470,
    },
  ],
  shipping: {
    shippingType: "HOME",
    recipientName: "李佳蓉",
    phone: "+886912345678",
    postalCode: "110",
    city: "臺北市",
    district: "信義區",
    detailAddress: "松高路 11號 5樓",
  },
};

const ok = (data: object) => ({ result: true, data });

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <NextIntlClientProvider locale="ko" messages={ko}>
      {children}
    </NextIntlClientProvider>
  </QueryClientProvider>
);

describe("OrderDetail", () => {
  beforeEach(() => {
    useUserAuthStore.setState({ id: 1, isAuthenticated: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("주문번호·상태·주문 일시(대만 시각)·상품·택배 주소·결제·발표·금액을 그린다", async () => {
    getUserOrderDetail.mockResolvedValue(ok(base));

    render(<OrderDetail orderId={481} />, { wrapper });

    expect(await screen.findByText("SM-20261106-000011")).toBeInTheDocument();
    expect(screen.getByText(ko.order_status_paid)).toBeInTheDocument();
    expect(screen.getByText("2026/11/06 15:05")).toBeInTheDocument();
    expect(screen.getByText("크롭 가디건")).toBeInTheDocument();
    expect(screen.getByText("李佳蓉")).toBeInTheDocument();
    expect(
      screen.getByText(/臺北市 信義區 松高路 11號 5樓/),
    ).toBeInTheDocument();
    expect(screen.getByText("2026/11/06 15:09")).toBeInTheDocument();
    expect(screen.getByText("LY74004967")).toBeInTheDocument();
    expect(screen.getByText("/ABC1234")).toBeInTheDocument();
    expect(screen.getAllByText("NT$1,530").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: ko.payment_retry })).toBeNull();
  });

  it("편의점 픽업이면 체인·매장명·매장 주소를 그린다", async () => {
    getUserOrderDetail.mockResolvedValue(
      ok({
        ...base,
        shipping: {
          shippingType: "CVS",
          recipientName: "李佳蓉",
          phone: "0912345678",
          postalCode: null,
          city: null,
          district: null,
          detailAddress: null,
          cvsStore: {
            logisticsSubType: "UNIMARTC2C",
            storeId: "131386",
            storeName: "建盛門市",
            storeAddress: "台北市中正區重慶南路一段122號",
            isOutsideIsland: false,
          },
        },
      }),
    );

    render(<OrderDetail orderId={481} />, { wrapper });

    expect(
      (await screen.findAllByText(/7-ELEVEN 建盛門市/)).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("台北市中正區重慶南路一段122號"),
    ).toBeInTheDocument();
  });

  it("발행 전이면 발행 중 문구", async () => {
    getUserOrderDetail.mockResolvedValue(
      ok({ ...base, invoice: { type: "MEMBER_CARRIER", status: "PENDING" } }),
    );

    render(<OrderDetail orderId={481} />, { wrapper });

    expect(await screen.findByText(ko.invoice_issuing)).toBeInTheDocument();
  });

  it("입금 대기면 가상계좌와 기한을 보여 준다", async () => {
    getUserOrderDetail.mockResolvedValue(
      ok({
        ...base,
        status: "PAYMENT_WAITING",
        paidAt: null,
        payment: {
          paymentId: 13,
          method: "ECPAY",
          status: "WAITING_DEPOSIT",
          amount: 1530,
          depositInfo: {
            paymentType: "ATM_LAND",
            bankCode: "005",
            account: "5219111913127434",
          },
          expireAt: "2026-11-08T15:59:59Z",
        },
      }),
    );

    render(<OrderDetail orderId={481} />, { wrapper });

    expect(
      await screen.findByText(ko.order_status_payment_waiting),
    ).toBeInTheDocument();
    expect(screen.getByText("5219111913127434")).toBeInTheDocument();
    expect(screen.getByText(/2026\/11\/08 23:59/)).toBeInTheDocument();
  });

  it("결제 전이면 안내와 다시 결제하기 버튼이 있고, 누르면 결제 시작을 부른다", async () => {
    getUserOrderDetail.mockResolvedValue(
      ok({ ...base, status: "PENDING", paidAt: null, payment: null }),
    );
    postUserOrderPayment.mockResolvedValue(
      ok({
        paymentId: 14,
        method: "ECPAY",
        handoffUrl: "https://h",
        resultToken: "t",
      }),
    );

    render(<OrderDetail orderId={481} />, { wrapper });

    expect(await screen.findByText(ko.order_repay_notice)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: ko.payment_retry }));

    await waitFor(() =>
      expect(postUserOrderPayment).toHaveBeenCalledWith({
        orderId: 481,
        languageCode: "ko",
      }),
    );
  });

  it("주문을 못 찾으면 안내한다", async () => {
    const error = Object.assign(new Error("404"), {
      name: "HTTPError",
      response: new Response("{}", { status: 404 }),
    });
    getUserOrderDetail.mockRejectedValue(error);

    render(<OrderDetail orderId={999} />, { wrapper });

    expect(
      await screen.findByText(ko.order_detail_not_found),
    ).toBeInTheDocument();
  });

  it("매장 종류(logisticsSubType)가 없으면 매장명만 보여 준다", async () => {
    getUserOrderDetail.mockResolvedValue(
      ok({
        ...base,
        shipping: {
          shippingType: "CVS",
          recipientName: "李佳蓉",
          phone: "0912345678",
          postalCode: null,
          city: null,
          district: null,
          detailAddress: null,
          cvsStore: {
            storeName: "全家 信義店",
            storeAddress: "台北市信義區",
            isOutsideIsland: false,
          },
        },
      }),
    );

    render(<OrderDetail orderId={481} />, { wrapper });

    expect((await screen.findAllByText(/全家 信義店/)).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText(/undefined/)).toBeNull();
  });
});
