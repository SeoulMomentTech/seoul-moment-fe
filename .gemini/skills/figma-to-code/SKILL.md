---
name: figma-to-code
description: 피그마 설계를 분석하여 프로젝트의 Tailwind v4 기반 기술 스택 및 컨벤션에 맞춰 코드로 변환합니다. UI 컴포넌트 라이브러리(@seoul-moment/ui)를 우선적으로 활용합니다.
---

# Figma to Code Skill

이 스킬은 피그마 설계를 분석하여 Seoul Moment 프로젝트의 표준 기술 스택과 컨벤션에 맞는 React 코드로 변환하는 가이드를 제공합니다.

## 프로젝트 표준 기술 스택

- **Framework**: Next.js (App Router) 또는 Vite (React)
- **Styling**: Tailwind CSS v4
- **UI Library**: `@seoul-moment/ui` (내부 컴포넌트 라이브러리)
- **Icons**: Lucide React (또는 프로젝트 내 SVG)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)

## 워크플로우

1. **디자인 분석 (`get_design_context`)**: 피그마 URL 또는 Node ID를 사용하여 디자인 메타데이터와 코드를 추출합니다.
2. **컴포넌트 매핑**: 디자인의 각 요소를 `@seoul-moment/ui` 컴포넌트로 매핑합니다.
3. **레이아웃 구조화**: `VStack`, `HStack`, `Flex` 컴포넌트를 사용하여 레이아웃을 구성합니다.
4. **스타일링 적용**: Tailwind v4 유틸리티 클래스를 사용하여 세부 스타일을 조정합니다.
5. **인터랙션 및 상태 추가**: 필요한 경우 클릭 핸들러, 로딩 상태, Zustand 스토어 연결 등을 추가합니다.

## 코드 변환 원칙

### 1. @seoul-moment/ui 우선 사용
디자인 요소가 UI 라이브러리에 존재하는 경우, 직접 구현하는 대신 라이브러리 컴포넌트를 사용합니다.
- `Button`, `Input`, `Badge`, `Card`, `Dialog`, `Tabs` 등
- 레이아웃: `VStack` (세로), `HStack` (가로), `Flex` (유연한 레이아웃)

### 2. 레이아웃 컨벤션
- 마진(Margin) 대신 **Gap** 사용을 권장합니다 (`VStack`, `HStack`의 `gap` 속성 활용).
- 패딩(Padding)은 컨테이너 컴포넌트에서 Tailwind 클래스로 처리합니다 (`p-4`, `px-6` 등).
- **Absolute/Relative 지양**: `absolute` 및 `relative` 포지셔닝은 유지보수와 반응형 대응을 위해 꼭 필요한 경우(예: 오버레이, 배지 등)를 제외하고는 사용을 자제합니다. 대신 Flexbox (`VStack`, `HStack`)와 Grid 레이아웃을 우선적으로 활용하여 요소의 흐름을 구성합니다.

### 3. 스타일링 (Tailwind v4)
- 하드코딩된 색상값 대신 Tailwind 테마 변수를 사용합니다.
- 폰트 크기, 간격 등은 테마 시스템에 정의된 값을 따릅니다.

### 4. 코드 구조
- **Client Component**: 인터랙션이 필요한 경우 파일 상단에 `'use client';`를 명시합니다.
- **Props**: 컴포넌트의 Props 타입을 명확히 정의합니다.

## 예시: 변환 패턴

### 가로 배치 (Header/Action Bar)
```tsx
import { HStack, Button } from "@seoul-moment/ui";

export function Header() {
  return (
    <HStack justify="between" align="center" className="w-full py-4 px-6 border-b border-neutral-100">
      <h1 className="text-xl font-bold">제목</h1>
      <HStack gap={8}>
        <Button variant="outline">취소</Button>
        <Button>저장</Button>
      </HStack>
    </HStack>
  );
}
```

### 세로 배치 (Card List)
```tsx
import { VStack, Card } from "@seoul-moment/ui";

export function ProfileCard() {
  return (
    <Card className="p-6">
      <VStack gap={16} align="center">
        <div className="w-20 h-20 rounded-full bg-neutral-200" />
        <VStack gap={4} align="center">
          <span className="text-lg font-semibold">사용자 이름</span>
          <span className="text-sm text-neutral-500">user@example.com</span>
        </VStack>
      </VStack>
    </Card>
  );
}
```

## 참고 사항
- 디자인의 복잡도가 높은 경우, 작은 단위의 컴포넌트로 분할하여 구현합니다.
- 이미지 자산은 `public/` 디렉토리에 배치하고 Next.js `Image` 컴포넌트를 사용합니다.