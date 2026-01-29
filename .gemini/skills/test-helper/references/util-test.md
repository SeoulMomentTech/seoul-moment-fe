# Utility Test Example (Vitest)

> 본 문서는 **SKILL.md에서 정의한 테스트 작성 원칙을 실제 코드로 보여주기 위한 예제**입니다.

---

## 테스트 목적

- 공통 유틸 함수의 안정성 확보
- 작은 변경으로 인한 전체 사이드 이펙트 방지
- 여러 영역에서 재사용되는 로직에 대한 신뢰도 확보

---

## 테스트 목표

- 순수 함수(pure function) 테스트
- 입력 → 출력 관계를 명확히 검증
- 정상 케이스 + 엣지 케이스 포함

---

## 적용 원칙 (SKILL.md 기준)

- React / DOM 의존 ❌
- 상태 및 side-effect 없음
- mock 사용 최소화
- 테스트는 빠르고 단순하게 유지
- 테스트 실패 시 **원인이 즉시 드러나야 함**

---

## 언제 util 테스트를 작성하는가?

- 여러 컴포넌트 / hook에서 공통으로 사용
- 계산, 변환, 포맷팅 로직 포함
- 한 번 작성되면 장기간 유지되는 코드

👉 이 경우 util 테스트는 **가장 먼저 작성하는 것이 이상적**

---

## 예제 코드: 날짜 포맷 유틸

> 요구사항
>
> - Date 객체를 `yyyy-mm-dd` 형식의 문자열로 변환
> - 유효하지 않은 값은 빈 문자열 반환

```ts
import { describe, it, expect } from "vitest";
import { formatDate } from "@/utils/formatDate";

describe("formatDate", () => {
  it("returns formatted date when input is valid", () => {
    // given
    const date = new Date("2024-01-01");

    // when
    const result = formatDate(date);

    // then
    expect(result).toBe("2024-01-01");
  });

  it("returns empty string when input is invalid", () => {
    // given
    const invalidDate = null as unknown as Date;

    // when
    const result = formatDate(invalidDate);

    // then
    expect(result).toBe("");
  });
});
```
