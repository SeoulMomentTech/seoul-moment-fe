import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGuestCartIdStore } from "@entities/cart/model/guestId";

import messages from "@/i18n/messages/ko.json";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";

import { Header } from "./Header";

// `@/i18n/navigation` 을 실제 모듈로 두면 next/navigation 을 ESM 으로 해석하려다
// vitest 에서 실패한다(entities/cart 배럴 → CartLineRow 체인, useAddToCartDraft.test.tsx
// 참고). Link 는 href·children 을 그대로 렌더링해 쿼리 대상으로 쓸 수 있게 한다.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    className,
    "aria-label": ariaLabel,
  }: {
    children: ReactNode;
    href: string;
    className?: string;
    "aria-label"?: string;
  }) => (
    <a aria-label={ariaLabel} className={className} href={href}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

vi.mock("next/image", () => ({ default: () => null }));

// 게스트 카트 훅 체인(useLanguage)이 useParams 를 탄다. 라우트 밖이라 null 이 온다.
vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const authState = {
  isAuthenticated: false,
  id: 0,
  hasHydrated: true,
  logout: vi.fn(),
};

vi.mock("@shared/lib/hooks/useUserAuthStore", () => ({
  // Desktop/Mobile 은 셀렉터로, LoginStatus 는 셀렉터 없이 부른다. 둘 다 받아야 한다.
  useUserAuthStore: (selector?: (state: typeof authState) => unknown) =>
    selector ? selector(authState) : authState,
  useUserAuthHydrated: () => authState.hasHydrated,
}));

// BrandMenuModal 이 useMediaQuery → window.matchMedia 를 탄다. jsdom 에는 없다.
window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})) as unknown as typeof window.matchMedia;

const renderHeader = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="ko" messages={messages}>
        <Header />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
};

describe("Header — 게스트(비로그인, 복원 완료)", () => {
  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.hasHydrated = true;
    // 게스트 장바구니도 복원이 끝난 상태로 둔다 — 이 테스트는 헤더의 게이트를 보는
    // 것이지 복원 대기 상태를 보는 것이 아니다.
    useGuestCartIdStore.setState({ guestId: null, hasHydrated: true });
  });

  it("데스크탑 헤더에 장바구니 링크가 보인다", () => {
    // 회귀 대상: Desktop() 이 `{isSignedIn && <CartButton />}` 로 장바구니 자체를
    // 한 번 더 가리고 있었다 — CartButton 안의 게이트를 열어도 이 바깥 게이트가
    // 여전히 게스트를 막았다. 모바일 헤더는 애초에 무조건 렌더링이라 증상이 데스크탑
    // 에서만 나타난다.
    renderHeader();

    const secondaryNav = screen.getByRole("navigation", { name: "Secondary" });

    expect(
      within(secondaryNav).getByRole("link", { name: "장바구니" }),
    ).toHaveAttribute("href", "/cart");
  });

  it("데스크탑 헤더에 마이페이지 링크는 여전히 보이지 않는다", () => {
    // 이 게이트는 의도된 것이다 — 마이페이지는 회원 전용이라 건드리지 않는다.
    renderHeader();

    const secondaryNav = screen.getByRole("navigation", { name: "Secondary" });

    expect(
      within(secondaryNav).queryByRole("link", { name: "MyPage" }),
    ).not.toBeInTheDocument();
  });
});
