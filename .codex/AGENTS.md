# 프로젝트 개요

- 프레임워크 NextJS(React)
- 언어: Typescript
- 스타일링: TailwindCSS
- 클라이언트 상태 관리: zustand
- 데이터 패칭: ky
- 서버상태 관리: @tanstack/react-query

# 프로젝트 구조

- `src/app`: Next.js App Router
- FSD(Feature-Sliced Design) 패턴 구조 활용
- FSD 디렉터리 가이드
  - `shared`: 공통 유틸, 서비스(api), hooks 등을 포함하며 모든 레이어에서 접근 가능합니다.
  - `entities`: UI와 비즈니스 로직이 결합된 최소 단위 컴포넌트(엔티티)를 담고 있습니다.
  - `features`: 특정 사용자 시나리오를 해결하는 기능 단위 모듈이며, 모델/서비스/훅/컴포넌트를 포함합니다.
  - `widgets`: 여러 feature와 entity를 조합한 UI 섹션입니다.
  - `views`: 페이지 단위 컴포지션을 다루며, App Router의 라우트와 연계됩니다.
  - `i18n`: locale 메시지와 국제화 유틸을 관리합니다.

# 프로젝트 명령

- `pnpm run dev`: Start the development server
- `pnpm run build`: Build for production
- `pnpm run test`: Run all unit tests with Jest

# 코딩 스타일

- 항상 미사용중이거나 console.log 같은 코드는 정리합니다.
- 현재 프로젝트내 설정되어 있는 eslint 규칙들을 준수합니다.
- 폴더 생성시 이름은 kebab-case로 합니다.
- 컴포넌트의 파일 및 네이밍은 항상 pascal-case로 합니다.
- 중복되는 상수 값의 경우 재활용 할 수 있도록 생성합니다.
- 매직 넘버는 유지보수를 위해 항상 상수로 관리합니다.

# 추가 안내

- 상태/데이터 흐름

  - URL 쿼리 기반 필터는 `nuqs`의 `useQueryStates`로 관리합니다. `optionIdList`처럼 배열 파라미터는 `parseAsArrayOf`를 사용해야 합니다.
  - 서버 상태는 전역적으로 `@tanstack/react-query`를 사용하며, 공통 훅(`useProductFilterList`, `useInfiniteProducts` 등)을 우선적으로 활용합니다.
  - 옵션 필터 토글 로직은 `@shared/lib/utils/filter.ts`의 `mergeOptionIdList`로 분리되어 있으니 동일 로직이 필요할 때 재사용합니다.

- i18n 및 API 호출

  - `useLanguage()` 훅이 App Router `params.locale`을 기반으로 언어 코드를 제공합니다.
  - `shared/services` 내 `api` 인스턴스는 `languageCode` 쿼리 파라미터를 읽어 `Accept-Language` 헤더로 변환하므로, GET 요청 시 `languageCode`를 searchParams에 포함시키는 것이 규칙입니다.

- 개발 시 참고
  - `pnpm run dev` 명령은 실행 전 자동으로 `pnpm i18n:sync`(Google Sheet ↔︎ locale 싱크)를 수행하므로, 로컬에 Google 자격 증명이 필요한 경우 미리 준비합니다.
  - 라우터/페이지 구성은 FSD를 따르며, `features`에서 도메인 로직, `widgets`에서 조합된 UI, `views`에서 페이지 구성을 확인할 수 있습니다.
  - 모달, 시트 등 오버레이 UI는 Radix UI를 기반으로 하고 있으며, lazy import를 통해 CSR 환경에서 번들 크기를 완화하는 패턴(`React.lazy`)이 사용됩니다.
