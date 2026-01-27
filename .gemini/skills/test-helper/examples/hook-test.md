# Hook Test Example (React + Vitest)

> 본 문서는 **SKILL.md에서 정의한 테스트 작성 원칙을 실제 코드로 보여주기 위한 예제**입니다.

---

## 목적

- “훅 테스트는 복잡하다”는 인식 제거
- React Hook을 **공식적인 방식**으로 안전하게 테스트하는 기준 제시

---

## 테스트 목표

- Hook의 상태 변화 검증
- 반환된 함수의 동작 검증
- React 렌더링 사이클을 고려한 테스트 작성

---

## 사용 도구

- Vitest
- @testing-library/react (`renderHook`, `act`)

---

## 적용 원칙 (SKILL.md 기준)

- Hook은 반드시 `renderHook`을 통해 실행
- 상태 변경은 항상 `act`로 감싸기
- 내부 구현이 아닌 **외부로 드러나는 API만 검증**

---

## 예제 코드

```ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "@/hooks/useCounter";

describe("useCounter", () => {
  it("increments count when increment is called", () => {
    // given
    const { result } = renderHook(() => useCounter());

    // when
    act(() => {
      result.current.increment();
    });

    // then
    expect(result.current.count).toBe(1);
  });
});
```
