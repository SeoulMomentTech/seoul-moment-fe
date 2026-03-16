# Seoul Moment Frontend Monorepo

This repository uses a pnpm-based monorepo layout.
For detailed guidelines on structure, commands, and tooling, refer to:
- @.gemini/docs/monorepo.md

## Core Applications

- **Web (Next.js)**: 메인 서비스 애플리케이션
  - 가이드: @apps/web/.gemini/GEMINI.md
- **Admin (Vite/React)**: 어드민 백오피스
  - 가이드: @apps/admin/.gemini/GEMINI.md

## AI Commands & Workflows

이 프로젝트에는 반복 작업을 자동화하기 위한 커스텀 Gemini 명령어가 설정되어 있습니다.

- `gemini swagger-gen "[요청]"`: OpenAPI 명세를 읽어 API 서비스 코드를 자동 생성합니다.
- `gemini code-review`: PR 생성 전 변경 사항에 대한 시니어급 코드 리뷰를 수행합니다.
- `gemini apply-review`: 코드 리뷰 피드백을 실제 코드에 반영합니다.
- `gemini figma-to-code "[URL]"`: 피그마 설계를 Tailwind V4 코드로 변환합니다.

자세한 스킬 및 커맨드 설정은 `.gemini/commands` 및 `.gemini/skills` 디렉토리를 참조하세요.
