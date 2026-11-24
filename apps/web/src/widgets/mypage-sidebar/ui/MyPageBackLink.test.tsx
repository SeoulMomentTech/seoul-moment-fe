import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";

import ko from "@/i18n/messages/ko.json";

import { render, screen } from "@testing-library/react";

import { MyPageBackLink } from "./MyPageBackLink";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a className={className} href={`/ko${href}`}>
      {children}
    </a>
  ),
}));

describe("MyPageBackLink", () => {
  it("상위 화면으로 가는 링크를 모바일에서만 보여준다", () => {
    render(
      <NextIntlClientProvider locale="ko" messages={ko}>
        <MyPageBackLink href="/mypage" />
      </NextIntlClientProvider>,
    );

    const link = screen.getByRole("link", { name: ko.back });
    expect(link).toHaveAttribute("href", "/ko/mypage");
    expect(link.className).toContain("sm:hidden");
  });
});
