import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import { useImeSafeEnter } from "./useImeSafeEnter";

interface HarnessProps {
  enabled?: boolean;
  onSubmit(): void;
}

const Harness = ({ enabled = true, onSubmit }: HarnessProps) => {
  const handlers = useImeSafeEnter({ enabled, onSubmit });

  return (
    <textarea
      aria-label="composer"
      onCompositionEnd={handlers.onCompositionEnd}
      onCompositionStart={handlers.onCompositionStart}
      onKeyDown={handlers.onKeyDown}
    />
  );
};

const composer = () => screen.getByLabelText("composer");

describe("useImeSafeEnter", () => {
  it("맨 Enter 는 전송한다", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.keyDown(composer(), { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("조합 중 Enter(nativeEvent.isComposing)는 전송하지 않는다", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    // fireEvent 는 isComposing 을 네이티브 이벤트에 실어준다 — 즉 이 테스트는
    // 정확히 `e.nativeEvent.isComposing` 접근 경로를 검증한다.
    fireEvent.keyDown(composer(), { isComposing: true, key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("compositionend 직후 같은 태스크의 Enter 도 막는다 (WebKit 경로)", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    // macOS Safari 는 확정 Enter 의 keydown 보다 compositionend 를 먼저 던지고
    // 그 keydown 의 isComposing 은 false 다. rAF 지연 해제가 유일한 방어.
    fireEvent.compositionStart(composer());
    fireEvent.compositionEnd(composer());
    fireEvent.keyDown(composer(), { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("레거시 IME 신호(keyCode 229 / key Process)를 막는다", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.keyDown(composer(), { keyCode: 229 });
    fireEvent.keyDown(composer(), { key: "Process" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Shift+Enter 는 개행이므로 전송하지 않는다", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.keyDown(composer(), { key: "Enter", shiftKey: true });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Enter 를 누른 채 두어도(repeat) 연속 전송하지 않는다", () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.keyDown(composer(), { key: "Enter", repeat: true });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("enabled=false(터치)면 Enter 로 전송하지 않는다", () => {
    const onSubmit = vi.fn();
    render(<Harness enabled={false} onSubmit={onSubmit} />);

    fireEvent.keyDown(composer(), { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("조합이 끝나고 다음 프레임이 지나면 Enter 가 다시 전송한다", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    fireEvent.compositionStart(composer());
    fireEvent.compositionEnd(composer());
    // rAF 한 프레임 통과
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    fireEvent.keyDown(composer(), { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
