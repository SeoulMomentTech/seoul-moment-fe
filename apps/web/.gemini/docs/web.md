# Seoul Moment Web (AI Engineering Guide)

메인 웹 서비스의 아키텍처 및 코딩 규약 가이드입니다.

## Tech Stack & Conventions
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 (Inline utility classes 우선 사용)
- **State**: Zustand (Store는 `shared/model` 또는 각 feature의 `model`에 배치)
- **API**: `shared/services`의 `fetcher` 활용. API 함수 생성 시 `swagger-gen` 스킬 우선 활용.

## FSD Layering Rules (AI 필수 준수)
- **app**: 전역 설정, Provider, 라우팅. (로직 최소화)
- **views**: 페이지 단위 구성. 데이터 페칭은 가급적 여기서 시작하여 props로 전달.
- **widgets**: 여러 페이지에서 공통으로 쓰이는 큰 단위 UI 블록.
- **features**: 사용자 인터랙션이 포함된 기능 단위. (예: `AuthForm`, `SearchProduct`)
- **entities**: 비즈니스 모델, 상태, 최소 단위 UI. (예: `UserCard`, `ProductItem`)
- **shared**: 가장 하위 레이어. UI 컴포넌트(`@seoul-moment/ui`), 유틸리티, API Fetcher.

## Coding Standards for AI
1. **Component**: 모든 컴포넌트는 `export function` 형태를 사용하며, PascalCase를 준수합니다.
2. **Icons**: `lucide-react` 아이콘을 우선 사용합니다.
3. **Images**: `next/image` 사용 시 반드시 `sizes` 속성을 정의하여 최적화합니다.
4. **Types**: 명시적인 Interface 정의를 권장하며, `any` 사용을 금지합니다.

## Scripts
- `pnpm dev`: i18n 싱크를 포함한 개발 서버 실행
- `pnpm i18n:sync`: 번역 데이터 동기화 (번역 키 누락 시 실행 제안)
