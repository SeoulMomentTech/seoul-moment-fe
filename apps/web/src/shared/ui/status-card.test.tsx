import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import {
  StatusCard,
  StatusInfo,
  StatusNotice,
  StatusPill,
} from "./status-card";

describe("StatusCard", () => {
  it("상태 톤과 회전 링을 마크에 싣고 제목·설명·본문·버튼을 그린다", () => {
    render(
      <StatusCard
        actions={<button type="button">go</button>}
        description="desc"
        icon="↗"
        spinning
        title="title"
        tone="progress"
      >
        <StatusPill>SM-1</StatusPill>
      </StatusCard>,
    );

    const mark = screen.getByTestId("status-mark");
    expect(mark).toHaveAttribute("data-tone", "progress");
    expect(mark).toHaveAttribute("data-spinning", "true");
    expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument();
    expect(screen.getByText("desc")).toBeInTheDocument();
    expect(screen.getByText("SM-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "go" })).toBeInTheDocument();
  });

  it("StatusInfo 는 라벨·값 행을 그리고 total 행을 구분한다", () => {
    render(
      <StatusInfo
        rows={[
          { label: "결제 수단", value: "ECPay" },
          { label: "결제 금액", value: "NT$2,040", total: true },
        ]}
      />,
    );

    expect(screen.getByText("결제 수단")).toBeInTheDocument();
    expect(
      screen.getByText("NT$2,040").closest("[data-total]"),
    ).toHaveAttribute("data-total", "true");
  });

  it("StatusNotice 는 톤을 싣는다", () => {
    render(<StatusNotice tone="danger">x</StatusNotice>);

    expect(screen.getByText("x")).toHaveAttribute("data-tone", "danger");
  });
});
