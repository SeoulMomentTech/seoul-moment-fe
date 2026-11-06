import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

import ko from "@/i18n/messages/ko.json";

import { fireEvent, render, screen } from "@testing-library/react";

import { OrderCvsPickupPanel } from "./OrderCvsPickupPanel";
import {
  orderCvsPickupResolver,
  type OrderCvsPickupValues,
} from "../model/schema";

const onOpenMap = vi.fn();
const onReselect = vi.fn();
const onRetry = vi.fn();

const store = {
  storeToken: "tok123",
  chain: "UNIMART" as const,
  logisticsSubType: "UNIMARTC2C",
  storeId: "131386",
  storeName: "建盛門市",
  storeAddress: "台北市中正區重慶南路一段122號",
  storeTelephone: null,
  isOutsideIsland: false,
};

type PanelProps = Omit<
  Parameters<typeof OrderCvsPickupPanel>[0],
  "form" | "onOpenMap" | "onReselect" | "onRetry"
>;

function Panel(props: Partial<PanelProps>) {
  const form = useForm<OrderCvsPickupValues>({
    resolver: orderCvsPickupResolver,
    defaultValues: { recipientName: "", phone: "" },
  });

  return (
    <OrderCvsPickupPanel
      chain={null}
      form={form}
      isStoreError={false}
      isStoreExpired={false}
      isStoreLoading={false}
      onOpenMap={onOpenMap}
      onReselect={onReselect}
      onRetry={onRetry}
      store={undefined}
      {...props}
    />
  );
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="ko" messages={ko}>
    {children}
  </NextIntlClientProvider>
);

describe("OrderCvsPickupPanel", () => {
  afterEach(() => {
    onOpenMap.mockReset();
    onReselect.mockReset();
    onRetry.mockReset();
  });

  it("매장이 없으면 빈 카드(제목·안내)와 체인 칩 세 개를 그린다", () => {
    render(<Panel />, { wrapper });

    expect(screen.getByText(ko.cvs_store_empty_title)).toBeInTheDocument();
    expect(screen.getByText(ko.cvs_store_empty)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(3);
  });

  it("체인 칩은 이동 표시 › 를 달되 접근 가능한 이름에는 넣지 않는다", () => {
    render(<Panel />, { wrapper });

    const chip = screen.getByRole("button", { name: "全家" });

    expect(chip.textContent).toContain("›");
  });

  it("칩을 누르면 그 체인으로 onOpenMap 을 부른다", () => {
    render(<Panel />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: "全家" }));

    expect(onOpenMap).toHaveBeenCalledWith("FAMI");
  });

  it("매장이 있으면 체인명·매장명·ID·주소와 다시 고르기 링크를 그린다", () => {
    render(<Panel chain="UNIMART" store={store} />, { wrapper });

    expect(screen.getByText("7-ELEVEN 建盛門市 · 131386")).toBeInTheDocument();
    expect(
      screen.getByText("台北市中正區重慶南路一段122號"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "7-ELEVEN" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(ko.cvs_store_reselect) }),
    );

    // 같은 체인 칩은 무시되므로 재선택은 칩과 다른 경로를 타야 한다
    expect(onReselect).toHaveBeenCalledTimes(1);
    expect(onOpenMap).not.toHaveBeenCalled();
  });

  it("조회 실패면 다시 시도 버튼이 onRetry 를 부른다", () => {
    render(<Panel chain="UNIMART" isStoreError />, { wrapper });

    fireEvent.click(screen.getByRole("button", { name: ko.please_try_again }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(ko.cvs_store_empty)).not.toBeInTheDocument();
  });

  it("만료면 만료 문구와 다시 고르기 버튼을 그리고, 버튼은 onReselect 를 부른다", () => {
    render(<Panel chain="UNIMART" isStoreExpired />, { wrapper });

    expect(screen.getByText(ko.cvs_store_expired)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(ko.cvs_store_reselect) }),
    );

    expect(onReselect).toHaveBeenCalledTimes(1);
    expect(onOpenMap).not.toHaveBeenCalled();
  });

  it("받는 분·휴대폰 입력칸이 있고 휴대폰은 +886 접두가 없다", () => {
    render(<Panel />, { wrapper });

    expect(
      screen.getByPlaceholderText(ko.cvs_recipient_placeholder),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0912345678")).toBeInTheDocument();
    expect(screen.queryByText("+886")).not.toBeInTheDocument();
  });
});
