import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import ko from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { OrderDetail } from "./OrderDetail";

const getUserOrderDetail = vi.fn();
const postUserOrderPayment = vi.fn();
const postUserOrderCancelRequest = vi.fn();
vi.mock("@shared/services/userOrder", async (importOriginal) => ({
  ...(await importOriginal<typeof UserOrderService>()),
  getUserOrderDetail: ({ orderId }: { orderId: number }) =>
    getUserOrderDetail(orderId),
  postUserOrderPayment: (req: unknown) => postUserOrderPayment(req),
  postUserOrderCancelRequest: (req: unknown) => postUserOrderCancelRequest(req),
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

  it("상태 배지는 서버 문구를 쓰고, 결제 완료면 배송 단계 진행바를 그린다", async () => {
    getUserOrderDetail.mockResolvedValue(
      ok({
        ...base,
        statusLabel: "已付款",
        deliveryStage: "PREPARING_ORDER",
        deliveryStageLabel: "商品準備中",
        deliveryStep: 2,
      }),
    );

    render(<OrderDetail orderId={481} />, { wrapper });

    expect(await screen.findByText("已付款")).toBeInTheDocument();
    const progress = screen.getByRole("progressbar", { name: "商品準備中" });
    expect(progress).toHaveAttribute("aria-valuenow", "2");
  });

  it("취소된 주문은 진행바 없이 배지로만 보여준다", async () => {
    getUserOrderDetail.mockResolvedValue(
      ok({
        ...base,
        status: "CANCELED",
        statusLabel: "訂單已取消",
        deliveryStage: "ORDER_CONFIRMED",
        deliveryStageLabel: "訂單確認",
        deliveryStep: 1,
      }),
    );

    render(<OrderDetail orderId={481} />, { wrapper });

    expect(await screen.findByText("訂單已取消")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("국제배송비 지원 할인이 있으면 금액 표에 할인 행을 그리고, 없으면 숨긴다", async () => {
    getUserOrderDetail.mockResolvedValue(
      ok({ ...base, internationalDiscount: 120, totalAmount: 1410 }),
    );

    const { unmount } = render(<OrderDetail orderId={481} />, { wrapper });

    expect(
      await screen.findByText(ko.international_shipping_discount),
    ).toBeInTheDocument();
    expect(screen.getByText("-NT$120")).toBeInTheDocument();

    unmount();
    getUserOrderDetail.mockResolvedValue(
      ok({ ...base, internationalDiscount: 0 }),
    );
    render(<OrderDetail orderId={481} />, { wrapper });

    expect(await screen.findByText("SM-20261106-000011")).toBeInTheDocument();
    expect(screen.queryByText(ko.international_shipping_discount)).toBeNull();
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

  describe("취소·환불", () => {
    const cancellable = {
      ...base,
      canRequestCancel: true,
      isQuickCancelPeriod: true,
      quickCancelUntil: "2026-11-07T07:09:00Z",
      cancellationRequestedAt: null,
      refund: null,
      refundedAmount: 0,
    };

    it("신청할 수 있으면 간편 취소 기한과 신청 버튼을 보인다", async () => {
      getUserOrderDetail.mockResolvedValue(ok(cancellable));

      render(<OrderDetail orderId={481} />, { wrapper });

      expect(
        await screen.findByRole("button", { name: ko.order_cancel_request }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(
          ko.order_cancel_quick_hint.replace("{time}", "2026/11/07 15:09"),
        ).length,
      ).toBeGreaterThan(0);
    });

    it("신청할 수 없으면 영역을 그리지 않는다", async () => {
      getUserOrderDetail.mockResolvedValue(
        ok({ ...cancellable, canRequestCancel: false }),
      );

      render(<OrderDetail orderId={481} />, { wrapper });

      await screen.findByText("SM-20261106-000011");
      expect(screen.queryByText(ko.order_cancel_section)).toBeNull();
    });

    it("사유와 함께 신청하고 주문을 다시 불러온다", async () => {
      getUserOrderDetail.mockResolvedValue(ok(cancellable));
      postUserOrderCancelRequest.mockResolvedValue(undefined);

      render(<OrderDetail orderId={481} />, { wrapper });

      fireEvent.click(
        await screen.findByRole("button", { name: ko.order_cancel_request }),
      );
      fireEvent.change(
        await screen.findByLabelText(ko.order_cancel_reason_label),
        { target: { value: "  사이즈를 잘못 골랐어요  " } },
      );
      const dialog = await screen.findByRole("dialog");
      fireEvent.click(
        within(dialog).getByRole("button", { name: ko.order_cancel_request }),
      );

      await waitFor(() =>
        expect(postUserOrderCancelRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            orderId: 481,
            reason: "사이즈를 잘못 골랐어요",
          }),
        ),
      );
      await waitFor(() => expect(getUserOrderDetail).toHaveBeenCalledTimes(2));
    });

    it("접수된 주문은 신청 시각과 환불 상태를 보이고 버튼은 없다", async () => {
      getUserOrderDetail.mockResolvedValue(
        ok({
          ...cancellable,
          status: "CANCELED",
          canRequestCancel: false,
          isQuickCancelPeriod: false,
          cancellationRequestedAt: "2026-11-06T08:00:00Z",
          refund: {
            status: "COMPLETED",
            amount: 1530,
            requestedAt: "2026-11-06T08:00:00Z",
            completedAt: "2026-11-06T08:01:00Z",
          },
          refundedAmount: 1530,
        }),
      );

      render(<OrderDetail orderId={481} />, { wrapper });

      expect(
        await screen.findByText(ko.order_cancel_section),
      ).toBeInTheDocument();
      expect(screen.getByText("2026/11/06 16:00")).toBeInTheDocument();
      expect(screen.getByText(ko.order_refund_completed)).toBeInTheDocument();
      expect(screen.getByText(ko.order_refund_card_notice)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: ko.order_cancel_request }),
      ).toBeNull();
    });

    it("취소를 접수한 결제 완료 주문은 헤더 상태 배지 옆에 취소 신청됨을 붙인다", async () => {
      getUserOrderDetail.mockResolvedValue(
        ok({
          ...cancellable,
          canRequestCancel: false,
          cancellationRequestedAt: "2026-11-06T08:00:00Z",
        }),
      );

      render(<OrderDetail orderId={481} />, { wrapper });

      const header = (await screen.findByText("SM-20261106-000011")).closest(
        "header",
      ) as HTMLElement;
      expect(
        within(header).getByText(ko.order_cancel_requested_badge),
      ).toBeInTheDocument();
    });

    it("이미 취소된 주문은 취소 신청됨을 따로 붙이지 않는다", async () => {
      getUserOrderDetail.mockResolvedValue(
        ok({
          ...cancellable,
          status: "CANCELED",
          canRequestCancel: false,
          cancellationRequestedAt: "2026-11-06T08:00:00Z",
        }),
      );

      render(<OrderDetail orderId={481} />, { wrapper });

      await screen.findByText("SM-20261106-000011");
      expect(screen.queryByText(ko.order_cancel_requested_badge)).toBeNull();
    });

    it("환불이 지연되면 고객센터 확인 안내를 보인다", async () => {
      getUserOrderDetail.mockResolvedValue(
        ok({
          ...cancellable,
          canRequestCancel: false,
          cancellationRequestedAt: "2026-11-06T08:00:00Z",
          refund: {
            status: "FAILED",
            amount: 1530,
            requestedAt: "2026-11-06T08:00:00Z",
          },
        }),
      );

      render(<OrderDetail orderId={481} />, { wrapper });

      expect(
        await screen.findByText(ko.order_refund_delayed_notice),
      ).toBeInTheDocument();
    });
  });
});
