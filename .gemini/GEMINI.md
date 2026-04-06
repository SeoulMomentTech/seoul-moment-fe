# Seoul Moment Frontend Monorepo

pnpm 기반 모노레포. 구조, 명령어, 코드 컨벤션은 `.gemini/docs/monorepo.md` 참조.

## Core Applications

- **Web (Next.js)**: 메인 서비스 — `apps/web/.gemini/docs/web.md`
- **Admin (Vite/React)**: 어드민 백오피스 — `apps/admin/.gemini/docs/admin.md`

## Shared Packages

- **UI 컴포넌트 라이브러리**: `packages/ui/.gemini/GEMINI.md`

## AI Commands & Workflows

반복 작업 자동화를 위한 커스텀 Gemini 명령어:

- `gemini swagger-gen "[요청]"`: OpenAPI 명세를 읽어 API 서비스 코드를 자동 생성
- `gemini code-review`: PR 생성 전 변경 사항에 대한 시니어급 코드 리뷰
- `gemini apply-review`: 코드 리뷰 피드백을 실제 코드에 반영
- `gemini figma-to-code "[URL]"`: 피그마 설계를 Tailwind V4 코드로 변환

자세한 스킬 및 커맨드 설정은 `.gemini/commands` 및 `.gemini/skills` 디렉토리 참조.
