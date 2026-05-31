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
    expect(screen.getByText(/2024年11月26日/)).toBeInTheDocument();
  });
});
