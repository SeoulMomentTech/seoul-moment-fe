# Seoul Moment Web

Seoul Moment 서비스의 메인 웹 프론트엔드 애플리케이션입니다.

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) & [ky](https://github.com/sindresorhus/ky)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **Monitoring**: [Sentry](https://sentry.io/)

## Architecture

FSD(Feature-Sliced Design) 방법론을 지향하여 설계되었습니다.

- `src/app`: 애플리케이션의 라우팅 레이어 및 최상위 구성 (Next.js App Router)
- `src/views`: 완성된 페이지 구성
- `src/widgets`: 여러 페이지에서 재사용되는 완성된 독립적 블록
- `src/features`: 사용자 가치 중심의 구체적 기능 (API 호출 로직 포함)
- `src/entities`: 비즈니스 엔티티 단위의 데이터 모델 및 최소 단위 로직
- `src/shared`: 프로젝트 전반에서 재사용되는 공통 컴포넌트, 훅, 유틸리티, 서비스 레이어

## Scripts

```bash
pnpm dev         # 개발 서버 실행 (i18n 싱크 포함)
pnpm build       # 프로덕션 빌드
pnpm start       # 빌드된 결과물 실행
pnpm lint        # ESLint 검사
pnpm test        # Vitest를 사용한 단위 테스트 실행
pnpm test:e2e    # Playwright를 사용한 E2E 테스트 실행
pnpm i18n:sync   # Google Spreadsheet에서 로케일 데이터 동기화
```

## i18n (Internationalization)

이 프로젝트는 다국어 처리를 위해 `next-intl`을 사용하며, 번역 파일은 `scripts/syncLocaleFromSheet.js`를 통해 관리 시트와 동기화됩니다. 번역 수정이 필요한 경우 시트를 업데이트한 후 `pnpm i18n:sync` 명령어를 실행하세요.

## Deployment

Netlify를 통해 배포되도록 설정되어 있으며, `netlify.toml` 파일을 통해 배포 설정을 관리합니다.
