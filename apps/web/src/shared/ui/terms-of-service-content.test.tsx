import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { TermsOfServiceContent } from "./terms-of-service-content";

describe("TermsOfServiceContent", () => {
  it("renders the major section titles", () => {
    // given / when
    render(<TermsOfServiceContent />);

    // then
    expect(
      screen.getByRole("heading", { name: "服務說明" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "交易條款" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "免責聲明" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "公司資訊" }),
    ).toBeInTheDocument();
  });

  it("renders the last updated date", () => {
    // given / when
    render(<TermsOfServiceContent />);

    // then
    expect(screen.getByText(/2024年11月26日/)).toBeInTheDocument();
  });
});
