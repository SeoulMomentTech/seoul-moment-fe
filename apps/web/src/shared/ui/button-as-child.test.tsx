import Link from "next/link";
import { describe, expect, it } from "vitest";

import { Button } from "@seoul-moment/ui";
import { render, screen } from "@testing-library/react";

/**
 * `@seoul-moment/ui` 의 Button 회귀 테스트. asChild 일 때 버튼 스타일이 자식(링크)에 바로 입혀져야
 * 버튼 전체가 눌린다 — 예전에는 자식을 div 로 감싸 Slot 이 그 div 에 스타일을 입히고, 링크는 글자
 * 크기만큼만 눌렸다(결제 결과·장바구니의 링크 버튼).
 */
describe("Button asChild", () => {
  it("스타일과 속성을 자식 링크에 바로 입히고 감싸는 요소를 만들지 않는다", () => {
    render(
      <Button asChild className="h-12" variant="outline">
        <Link href="/ko/cart">장바구니로 가기</Link>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "장바구니로 가기" });
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveClass("inline-flex", "h-12", "bg-white");
    expect(link.parentElement?.getAttribute("data-slot")).not.toBe("button");
    expect(link.querySelector("div")).toBeNull();
  });

  it("asChild 가 아니면 지금처럼 button 이고 로딩 표시를 넣는다", () => {
    render(<Button isLoading>저장</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector(".animate-spin")).not.toBeNull();
  });
});
