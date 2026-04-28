---
name: figma-to-code
description: 피그마 설계를 분석하여 프로젝트의 Tailwind v4 기반 기술 스택 및 컨벤션에 맞춰 코드로 변환합니다. UI 컴포넌트 라이브러리(@seoul-moment/ui)를 우선적으로 활용합니다.
---

# Figma to Code Skill

이 스킬은 피그마 설계를 분석하여 Seoul Moment 프로젝트의 표준 기술 스택과 컨벤션에 맞는 React 코드로 변환하는 가이드를 제공합니다. 문서가 방대해지는 것을 방지하기 위해 세부 규칙은 `references` 폴더의 문서를 참조합니다.

## 0. 필수 참조 문서 (References)
Figma 코드를 변환하기 전에 **반드시** 아래의 문서들을 확인하여 프로젝트의 규칙을 숙지하세요.
- **[Tailwind v4 Pattern]**: `.gemini/skills/figma-to-code/references/tailwind-v4-pattern.md` (디자인 토큰, 타이포그래피, 테마 변수 맵핑 가이드)
- **[UI Components Pattern]**: `.gemini/skills/figma-to-code/references/ui-components-pattern.md` (`@seoul-moment/ui` 컴포넌트 목록 및 `VStack`, `HStack` 레이아웃 구성 가이드)
- **[Architecture Pattern]**: `.gemini/skills/figma-to-code/references/architecture-pattern.md` (`apps/web`의 FSD 구조 및 `apps/admin`의 SPA 폴더 구조 가이드)

## 1. 프로젝트 기술 스택

본 프로젝트는 pnpm 기반의 Turborepo 모노레포 환경입니다.
- **앱 환경**: `apps/web` (Next.js 15, FSD), `apps/admin` (Vite SPA)
- **Styling**: Tailwind CSS v4 (`packages/tailwind-config`)
- **UI Library**: `@seoul-moment/ui` (`packages/ui`)
- **Icons**: Lucide React (`lucide-react`)
- **State/Data**: Zustand, TanStack Query

## 2. 핵심 변환 규칙 요약 (Cheat Sheet)

자세한 내용은 위 0번의 레퍼런스 문서들을 참조하며, 아래는 절대 어겨서는 안 되는 핵심 요약입니다.

### 🚫 금지 사항
- **하드코딩 절대 금지**: 색상(예: `text-[#f37b2a]`), 폰트 사이즈(예: `text-[24px]`), 레이아웃 수치(예: `w-[342px]`)를 임의로 작성하지 마세요.
- **Margin 기반 레이아웃 금지**: 요소 간의 간격 배치를 위해 `mt-4`, `mb-2` 등을 사용하지 마세요.

### ✅ 필수 적용 사항
- **Tailwind Tokens 사용**: `text-brand`, `bg-surface-soft`, `text-title-1`, `text-body-3` 등의 사전 정의된 클래스를 사용하세요.
- **UI 라이브러리 레이아웃 사용**: 간격과 정렬은 반드시 `@seoul-moment/ui`의 `<VStack gap={...}>` 및 `<HStack gap={...}>` 컴포넌트를 통해 구성하세요.
- **에셋 및 아이콘**: 벡터 아이콘은 `lucide-react` 컴포넌트로 대체하고, Next.js 환경의 이미지는 `next/image`를 사용하세요.

## 3. 워크플로우 요약

1. **레퍼런스 숙지**: `references/` 폴더 내의 토큰, UI 컴포넌트, 아키텍처 문서를 파악합니다.
2. **디자인 분석**: Figma Node ID 또는 URL을 통해 디자인 메타데이터와 코드를 추출합니다.
3. **토큰 맵핑**: 하드코딩된 값들을 Tailwind v4 Theme 클래스로 변환합니다.
4. **컴포넌트 조립**: HTML 태그 대신 `@seoul-moment/ui`의 레이아웃(`VStack`, `HStack`)과 기본 컴포넌트(`Card`, `Button` 등)를 조합하여 UI를 작성합니다.
5. **파일 배치**: 타겟 앱(`web` 또는 `admin`)의 아키텍처 규칙에 맞는 적절한 디렉토리에 코드를 삽입합니다.
6. **구현 검증 안내**: 파일 배치까지 끝나면 사용자에게 다음과 같이 묻습니다.

   > 구현이 완료되었습니다. `verify-against-figma` 스킬로 Figma 디자인과 실제 렌더링을 자동 비교해드릴까요? (dev 서버가 떠 있어야 합니다)

   사용자가 동의하면 `verify-against-figma` 스킬을 호출합니다. 이때 다음 정보를 인자로 전달합니다.
   - 작업한 Figma URL (또는 `fileKey` + `nodeId`)
   - 구현 결과를 확인할 라우트 (사용자에게 확인)
   - 앱 식별 (`web` | `admin`) — 작업 디렉토리에서 추론

   거절하면 그대로 종료합니다. **자동 호출이 아니라 사용자 확인 후 호출**임에 유의하세요.
