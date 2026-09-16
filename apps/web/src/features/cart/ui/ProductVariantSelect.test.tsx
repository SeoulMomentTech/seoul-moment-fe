import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";

import messages from "@/i18n/messages/ko.json";

import type { ProductVariantChoice } from "@entities/product";
import { fireEvent, render, screen } from "@testing-library/react";

import { ProductVariantSelect } from "./ProductVariantSelect";

// entities/cart 배럴이 CartLineRow 를 끌고 오고, 그게 next-intl 의 navigation 을 통해
// next/navigation 을 ESM 으로 해석하려 해서 vitest 에서 실패한다. 체인을 끊는다.
vi.mock("@/i18n/navigation", () => ({
  Link: () => null,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

/**
 * jsdom 26 에는 `PointerEvent` 가 없다. Radix Select 는 트리거를 `pointerdown` 으로 열고
 * (`button === 0 && pointerType === "mouse"`), 아이템은 `pointerup` 으로 고르므로
 * 포인터 없이는 열지도 고르지도 못한다.
 */
class PointerEventPolyfill extends MouseEvent {
  readonly pointerId: number;
  readonly pointerType: string;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.pointerType = init.pointerType ?? "mouse";
  }
}

beforeAll(() => {
  globalThis.PointerEvent = PointerEventPolyfill as typeof PointerEvent;
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

const choice = (variantId: number, label: string): ProductVariantChoice => ({
  variantId,
  label,
  options: [],
  isPurchasable: true,
  stockQuantity: 50,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="ko" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

/**
 * 사용자가 드롭다운을 열고 조합 하나를 고르는 한 번의 동작.
 *
 * 키보드로 조작한다. Radix 아이템의 포인터 선택은 그 아이템이 `pointerdown` 을 본 적
 * 있는지(`pointerTypeRef`)에 걸리지만, `keydown` 의 선택 경로에는 조건이 없다.
 */
const pick = (label: string) => {
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
  fireEvent.keyDown(screen.getByRole("option", { name: label }), {
    key: "Enter",
  });
};

describe("ProductVariantSelect", () => {
  /**
   * 고른 조합은 아래 라인 목록에 쌓인다. 드롭다운은 값을 들고 있는 컨트롤이 아니라
   * "이 조합을 담아라" 라는 명령이므로, 같은 조합을 다시 골라도 매번 알려야 한다.
   *
   * 라인을 지웠다가 같은 조합을 다시 고르는 흐름이 여기에 걸린다.
   */
  it("같은 조합을 두 번 고르면 두 번 다 알린다", () => {
    const onPick = vi.fn();

    render(
      <ProductVariantSelect
        choices={[choice(101, "레드 / S")]}
        onPick={onPick}
      />,
      { wrapper },
    );

    pick("레드 / S");
    pick("레드 / S");

    expect(onPick.mock.calls).toEqual([[101], [101]]);
  });

  it("다른 조합을 고르면 그 조합을 알린다", () => {
    const onPick = vi.fn();

    render(
      <ProductVariantSelect
        choices={[choice(101, "레드 / S"), choice(102, "레드 / M")]}
        onPick={onPick}
      />,
      { wrapper },
    );

    pick("레드 / S");
    pick("레드 / M");

    expect(onPick.mock.calls).toEqual([[101], [102]]);
  });
});
