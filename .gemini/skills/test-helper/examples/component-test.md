# Component Test Example (React + Vitest)

> 본 문서는 **SKILL.md에서 정의한 테스트 작성 원칙을 실제 코드로 보여주기 위한 예제**입니다.

---

## 테스트 목표

- 사용자 관점에서 컴포넌트 동작 검증
- 렌더링 결과와 사용자 이벤트 중심 테스트

---

## 적용 원칙 (SKILL.md 기준)

- 구현 디테일(state, 내부 함수) 직접 테스트 ❌
- props / UI / 이벤트 결과 위주로 검증 ⭕
- `@testing-library/react` 사용
- 사용자가 할 수 있는 행동만 테스트

---

## 예제 코드

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Button from "@/components/Button";

describe("Button", () => {
  it("calls onClick when button is clicked", async () => {
    // given
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click</Button>);

    // when
    await userEvent.click(screen.getByRole("button"));

    // then
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```
