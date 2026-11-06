import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import ko from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

import { OrderInvoiceSection } from "./OrderInvoiceSection";
import { OrderSection } from "./OrderSection";
import { useOrderInvoice } from "../model/useOrderInvoice";

const mobileCheck = vi.fn();
const loveCheck = vi.fn();
const companyCheck = vi.fn();

vi.mock("@shared/services/userInvoice", () => ({
  getUserInvoiceMobileBarcodeCheck: (code: string) => mobileCheck(code),
  getUserInvoiceLoveCodeCheck: (code: string) => loveCheck(code),
  getUserInvoiceCompanyCheck: (taxId: string) => companyCheck(taxId),
}));

const ok = (data: object) => ({ result: true, data });

function Harness() {
  const invoice = useOrderInvoice();

  return <OrderInvoiceSection invoice={invoice} />;
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <NextIntlClientProvider locale="ko" messages={ko}>
      {children}
    </NextIntlClientProvider>
  </QueryClientProvider>
);

const renderSection = () => render(<Harness />, { wrapper });

const typeAndBlur = (input: HTMLElement, value: string) => {
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
};

describe("OrderInvoiceSection", () => {
  afterEach(() => {
    mobileCheck.mockReset();
    loveCheck.mockReset();
    companyCheck.mockReset();
  });

  it("라디오 5개를 그리고 기본은 會員載具 이며 안내 한 줄만 보인다", () => {
    renderSection();

    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(
      screen.getByRole("radio", { name: ko.invoice_type_member_carrier }),
    ).toBeChecked();
    expect(
      screen.getByText(ko.invoice_member_carrier_hint),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("手機條碼를 고르면 그 아래에만 입력칸이 펼쳐진다", () => {
    renderSection();

    fireEvent.click(
      screen.getByRole("radio", { name: ko.invoice_type_mobile_barcode }),
    );

    expect(screen.getByPlaceholderText("/ABC1234")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(
      screen.queryByText(ko.invoice_member_carrier_hint),
    ).not.toBeInTheDocument();
  });

  it("형식이 틀린 채 blur 하면 형식 안내가 빨갛게 뜬다", async () => {
    renderSection();

    fireEvent.click(
      screen.getByRole("radio", { name: ko.invoice_type_mobile_barcode }),
    );
    typeAndBlur(screen.getByPlaceholderText("/ABC1234"), "ABC");

    const message = await screen.findByText(ko.invoice_mobile_barcode_invalid);
    expect(message).toHaveClass("text-danger");
    expect(mobileCheck).not.toHaveBeenCalled();
  });

  it("확인되면 ✓ 문구가 뜬다", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: true, verified: true }));
    renderSection();

    fireEvent.click(
      screen.getByRole("radio", { name: ko.invoice_type_mobile_barcode }),
    );
    typeAndBlur(screen.getByPlaceholderText("/ABC1234"), "/abc1234");

    expect(
      await screen.findByText(ko.invoice_check_verified),
    ).toBeInTheDocument();
    expect(mobileCheck).toHaveBeenCalledWith("/ABC1234");
  });

  it("등록되지 않은 값이면 빨간 안내가 뜬다", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: false, verified: true }));
    renderSection();

    fireEvent.click(
      screen.getByRole("radio", { name: ko.invoice_type_mobile_barcode }),
    );
    typeAndBlur(screen.getByPlaceholderText("/ABC1234"), "/ABC1234");

    expect(await screen.findByText(ko.invoice_check_not_found)).toHaveClass(
      "text-danger",
    );
  });

  it("愛心碼가 확인되면 기부처 이름이 뜬다", async () => {
    loveCheck.mockResolvedValue(
      ok({
        valid: true,
        verified: true,
        name: "財團法人台灣兒童暨家庭扶助基金會",
      }),
    );
    renderSection();

    fireEvent.click(
      screen.getByRole("radio", { name: ko.invoice_type_donation }),
    );
    typeAndBlur(screen.getByPlaceholderText("168001"), "168001");

    expect(
      await screen.findByText("財團法人台灣兒童暨家庭扶助基金會"),
    ).toBeInTheDocument();
  });

  it("公司는 두 칸이고 統一編號 확인 뒤 회사명이 채워진다", async () => {
    companyCheck.mockResolvedValue(
      ok({ valid: true, verified: true, name: "首爾映像有限公司" }),
    );
    renderSection();

    fireEvent.click(
      screen.getByRole("radio", { name: ko.invoice_type_company }),
    );

    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    typeAndBlur(screen.getByPlaceholderText("97025978"), "97025978");

    expect(
      await screen.findByDisplayValue("首爾映像有限公司"),
    ).toBeInTheDocument();
  });

  it("섹션 제목 옆에 보조 문구가 온다", () => {
    render(
      <OrderSection description="d" title="t">
        <span />
      </OrderSection>,
    );

    expect(screen.getByText("d")).toBeInTheDocument();
  });
});
