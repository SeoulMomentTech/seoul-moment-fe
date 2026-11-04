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
  "form" | "onOpenMap"
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
      isStoreExpired={false}
      isStoreLoading={false}
      onOpenMap={onOpenMap}
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
  afterEach(() => onOpenMap.mockReset());

  it("매장이 없으면 안내 문구와 체인 칩 세 개를 그린다", () => {
    render(<Panel />, { wrapper });

    expect(screen.getByText(ko.cvs_store_empty)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(3);
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

    expect(onOpenMap).toHaveBeenCalledWith("UNIMART");
  });

  it("만료면 만료 문구를 그린다", () => {
    render(<Panel chain="UNIMART" isStoreExpired />, { wrapper });

    expect(screen.getByText(ko.cvs_store_expired)).toBeInTheDocument();
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
