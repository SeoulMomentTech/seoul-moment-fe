import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { PrivacyPolicyContent } from "./privacy-policy-content";

describe("PrivacyPolicyContent", () => {
  it("renders the major section titles", () => {
    // given / when
    render(<PrivacyPolicyContent />);

    // then
    expect(screen.getByRole("heading", { name: "前言" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "個人資料保護法告知事項" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Cookie及類似技術" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "聯繫我們" }),
    ).toBeInTheDocument();
  });

  it("renders the last updated date", () => {
    // given / when
    render(<PrivacyPolicyContent />);

    // then
    // 정책 개정 시마다 깨지지 않도록 날짜 값이 아닌 형식을 검증한다.
    expect(
      screen.getByText(/最後更新日期：\d{4}年\d{1,2}月\d{1,2}日/),
    ).toBeInTheDocument();
  });
});
