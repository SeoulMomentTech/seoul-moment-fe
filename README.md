# Seoul Moment Frontend

Seoul Moment 서비스의 프론트엔드 모노레포입니다.

## 🏗 Repository Structure

본 프로젝트는 `pnpm` workspace와 `Turborepo`를 활용한 모노레포 구조로 관리됩니다.

### Apps

- **[web](./apps/web)**: Next.js 15 기반의 웹 서비스
- **[admin](./apps/admin)**: Vite + React 기반의 운영 관리용 백오피스 서비스

### Packages

- **[ui](./packages/ui)**: 전용 디자인 시스템 및 공통 UI 컴포넌트 라이브러리
- **[tailwind-config](./packages/tailwind-config)**: 공유 Tailwind CSS v4 설정 및 스타일 자산
- **[eslint-config](./packages/eslint-config)**: 워크스페이스 공통 Lint 규칙
- **[prettier-config](./packages/prettier-config)**: 워크스페이스 공통 포맷팅 규칙

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 이상 권장)
- [pnpm](https://pnpm.io/) (v9 이상 권장)

### Installation

```bash
pnpm install
```

### Development

루트에서 Turborepo를 통해 모든 앱을 동시에 또는 개별적으로 실행할 수 있습니다.

```bash
pnpm dev:web      # 메인 웹 서비스 실행
pnpm dev:admin    # 어드민 서비스 실행
```

## 🛠 Workspace Scripts

| Command          | Description                               |
| :--------------- | :---------------------------------------- |
| `pnpm build`     | 모든 패키지 및 애플리케이션 빌드          |
| `pnpm lint`      | 전체 프로젝트 린트 검사                   |
| `pnpm test`      | 전체 프로젝트 단위 테스트 실행            |
| `pnpm i18n:sync` | 다국어 번역 데이터 동기화 (Google Sheets) |

## 📐 Standards & Tooling

- **Turborepo**: 빌드 캐싱 및 파이프라인 최적화
- **Changesets**: (예정) 패키지 버전 관리 및 배포 자동화
- **Husky & lint-staged**: 커밋 전 코드 품질 검증 (`pre-commit`)
- **FSD (Feature-Sliced Design)**: `apps/web`에 적용된 아키텍처 방법론
