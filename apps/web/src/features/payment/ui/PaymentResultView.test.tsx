import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import type { GetPaymentResultRes } from "@shared/services/payment";

import ko from "@/i18n/messages/ko.json";

import { fireEvent, render, screen } from "@testing-library/react";

import { PaymentResultView } from "./PaymentResultView";
import { toPaymentResultState } from "../model/paymentResultState";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={`/ko${href}`}>{children}</a>
  ),
}));

const result = (
  payment: Partial<GetPaymentResultRes["payment"]>,
  orderStatus: GetPaymentResultRes["orderStatus"] = "PAID",
): GetPaymentResultRes => ({
  orderId: 481,
  orderNumber: "SM-20261104-000481",
  orderStatus,
  payment: {
    paymentId: 12,
    method: "ECPAY",
    status: "PAID",
    amount: 1160,
    ...payment,
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="ko" messages={ko}>
    {children}
  </NextIntlClientProvider>
);

const renderView = (state: Parameters<typeof PaymentResultView>[0]["state"]) =>
  render(<PaymentResultView state={state} />, { wrapper });

describe("toPaymentResultState", () => {
  it("REQUESTED·READY 는 checking", () => {
    expect(
      toPaymentResultState(
        {
          data: result({ status: "REQUESTED" }),
          isPending: false,
          isError: false,
        },
        false,
      ),
    ).toEqual({ kind: "checking", delayed: false });
    expect(
      toPaymentResultState(
        { data: result({ status: "READY" }), isPending: false, isError: false },
        true,
      ),
    ).toEqual({ kind: "checking", delayed: true });
  });

  it("FAILED·CANCELED·EXPIRED 는 failed 와 사유", () => {
    const failed = result({ status: "CANCELED" }, "PENDING");

    expect(
      toPaymentResultState(
        { data: failed, isPending: false, isError: false },
        false,
      ),
    ).toEqual({ kind: "failed", result: failed, reason: "canceled" });
    expect(
      toPaymentResultState(
        {
          data: result({ status: "EXPIRED" }, "PENDING"),
          isPending: false,
          isError: false,
        },
        false,
      ),
    ).toMatchObject({ kind: "failed", reason: "expired" });
    expect(
      toPaymentResultState(
        {
          data: result({ status: "FAILED" }, "PENDING"),
          isPending: false,
          isError: false,
        },
        false,
      ),
    ).toMatchObject({ kind: "failed", reason: "failed" });
  });

  it("폴링 중 일시 실패는 직전 결과를 유지한다", () => {
    expect(
      toPaymentResultState(
        {
          data: result({ status: "REQUESTED" }),
          isPending: false,
          isError: true,
        },
        false,
      ),
    ).toEqual({ kind: "checking", delayed: false });
  });

  it("에러면 not-found, 아직 없으면 loading", () => {
    expect(
      toPaymentResultState(
        { data: undefined, isPending: false, isError: true },
        false,
      ),
    ).toEqual({ kind: "not-found" });
    expect(
      toPaymentResultState(
        { data: undefined, isPending: true, isError: false },
        false,
      ),
    ).toEqual({ kind: "loading" });
  });
});

describe("PaymentResultView", () => {
  it("paid 는 완료 제목·주문번호·수단·금액을 그린다", () => {
    renderView({ kind: "paid", result: result({ status: "PAID" }) });

    expect(screen.getByText(ko.payment_paid_title)).toBeInTheDocument();
    expect(screen.getByText("SM-20261104-000481")).toBeInTheDocument();
    expect(screen.getByText(/ECPay · NT\$1,160/)).toBeInTheDocument();
    expect(screen.getByText(ko.payment_paid_line_hint)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: ko.payment_continue_shopping }),
    ).toHaveAttribute("href", "/ko/");
    expect(screen.queryByRole("link", { name: ko.go_to_cart })).toBeNull();
  });

  it("waiting ATM 은 은행명·가상계좌·금액·기한을 그린다", () => {
    renderView({
      kind: "waiting",
      result: result(
        {
          status: "WAITING_DEPOSIT",
          pgPaymentType: "ATM_LAND",
          depositInfo: {
            paymentType: "ATM_LAND",
            bankCode: "005",
            account: "5219111913127434",
          },
          expireAt: "2026-11-06T15:59:59Z",
        },
        "PAYMENT_WAITING",
      ),
    });

    expect(screen.getByText(ko.payment_waiting_title)).toBeInTheDocument();
    expect(screen.getByText(/土地銀行/)).toBeInTheDocument();
    expect(screen.getByText("5219111913127434")).toBeInTheDocument();
    expect(screen.getByText("NT$1,160")).toBeInTheDocument();
    expect(screen.getByText(/2026\/11\/06 23:59/)).toBeInTheDocument();
  });

  it("waiting CVS 는 납부 코드를 그린다", () => {
    renderView({
      kind: "waiting",
      result: result(
        {
          status: "WAITING_DEPOSIT",
          pgPaymentType: "CVS_CVS",
          depositInfo: { paymentType: "CVS_CVS", paymentNo: "LLL22251222" },
          expireAt: "2026-11-08T15:59:59Z",
        },
        "PAYMENT_WAITING",
      ),
    });

    expect(screen.getByText("LLL22251222")).toBeInTheDocument();
    expect(screen.queryByText(/土地銀行/)).toBeNull();
  });

  it("failed CANCELED 는 취소 사유와 장바구니 버튼을 그린다", () => {
    renderView({
      kind: "failed",
      result: result(
        { status: "CANCELED", failureCode: "10100058" },
        "PENDING",
      ),
      reason: "canceled",
    });

    expect(screen.getByText(ko.payment_failed_title)).toBeInTheDocument();
    expect(screen.getByText(ko.payment_reason_canceled)).toBeInTheDocument();
    expect(screen.getByText(/10100058/)).toBeInTheDocument();
    expect(screen.getByText(ko.payment_order_kept)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: ko.go_to_cart })).toHaveAttribute(
      "href",
      "/ko/cart",
    );
  });

  it("checking 은 확인 중, delayed 면 늦어진다는 문구", () => {
    const { rerender } = renderView({ kind: "checking", delayed: false });
    expect(screen.getByText(ko.payment_checking_title)).toBeInTheDocument();

    rerender(<PaymentResultView state={{ kind: "checking", delayed: true }} />);
    expect(screen.getByText(ko.payment_checking_delayed)).toBeInTheDocument();
  });

  it("not-found", () => {
    renderView({ kind: "not-found" });

    expect(
      screen.getByText(ko.payment_result_not_found_title),
    ).toBeInTheDocument();
    expect(
      screen.getByText(ko.payment_result_not_found_hint),
    ).toBeInTheDocument();
  });

  it("완료 화면은 초록 마크와 결제 일시(대만 시각)·수단·금액을 보여 준다", () => {
    renderView({
      kind: "paid",
      result: result({ status: "PAID", paidAt: "2026-11-06T06:32:00Z" }),
    });

    expect(screen.getByTestId("status-mark")).toHaveAttribute(
      "data-tone",
      "success",
    );
    expect(screen.getByText(ko.payment_paid_at)).toBeInTheDocument();
    expect(screen.getByText("2026/11/06 14:32")).toBeInTheDocument();
    expect(screen.getByText(ko.payment_method_label)).toBeInTheDocument();
  });

  it("확인 중은 진행 마크가 돈다", () => {
    renderView({ kind: "checking", delayed: false });

    const mark = screen.getByTestId("status-mark");
    expect(mark).toHaveAttribute("data-tone", "progress");
    expect(mark).toHaveAttribute("data-spinning", "true");
  });

  it("실패는 빨강 마크다", () => {
    renderView({
      kind: "failed",
      result: result({ status: "CANCELED" }, "PENDING"),
      reason: "canceled",
    });

    expect(screen.getByTestId("status-mark")).toHaveAttribute(
      "data-tone",
      "danger",
    );
  });

  it("입금 대기는 가상계좌를 복사할 수 있다", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderView({
      kind: "waiting",
      result: result(
        {
          status: "WAITING_DEPOSIT",
          depositInfo: {
            paymentType: "ATM_LAND",
            bankCode: "005",
            account: "5219111913127434",
          },
          expireAt: "2026-11-06T15:59:59Z",
        },
        "PAYMENT_WAITING",
      ),
    });

    fireEvent.click(screen.getByRole("button", { name: ko.payment_copy }));

    expect(writeText).toHaveBeenCalledWith("5219111913127434");
    expect(await screen.findByText(ko.payment_copied)).toBeInTheDocument();
  });
});
