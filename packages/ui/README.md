# @seoul-moment/ui

공통 컴포넌트들을 모아 두는 React 패키지입니다. Vite 라이브러리 모드로 번들되며 `apps/*` 프로젝트에서 바로 가져다 쓸 수 있습니다.

## 설치

```bash
pnpm add -F @seoul-moment/admin @seoul-moment/ui
```

> 다른 앱에서도 사용하려면 `@seoul-moment/admin` 자리에 원하는 패키지명을 바꿔서 같은 명령을 실행하면 됩니다.

## 사용법

```tsx
import { Button } from "@seoul-moment/ui";

export function Example() {
  return <Button variant="secondary">Hello</Button>;
}
```

### Tailwind 설정 (v4)

Tailwind v4에서는 `@source` 지시자로 스캔 대상을 지정해야 합니다. 각 앱의 글로벌 CSS(예: `src/index.css`) 최상단에 다음을 추가하세요.

```css
@source "../../packages/ui/src/**/*.{ts,tsx}";
@import "tailwindcss";
@import "@seoul-moment/tailwind-config";
```

의존성이 워크스페이스 밖에 있을 경우 상대 경로만 조정하면 됩니다. CI / 빌드 환경에서는 dist 산출물을 사용하므로 아래처럼 두 경로를 모두 넣어 두면 안전합니다.

```css
@source "../../packages/ui/**/*.{js,ts,jsx,tsx}";
```

또한 컴포넌트의 색상 토큰이 필요하다면 루트 엔트리에서 전역 스타일을 한 번만 불러옵니다.

```ts
import "@seoul-moment/ui/styles.css";
```

> UI 패키지를 수정한 뒤에는 `pnpm -F @seoul-moment/ui build`를 실행해 dist와 타입 선언을 갱신한 다음, 각 앱을 빌드하면 Turbo가 자동으로 최신 산출물을 참조합니다.

## 스크립트

- `pnpm dev` : 컴포넌트 샌드박스 개발 서버 (필요 시)
- `pnpm build` : 타입 선언 + ESM/CJS 번들 생성
- `pnpm lint` : ESLint 검사

## 구조

```
packages/ui
├── src
│   ├── components
│   │   └── ui
│   ├── lib
│   │   └── utils.ts
│   ├── styles.css
│   └── index.ts
```

새 컴포넌트를 추가할 때는 `src/components/ui/<component>.tsx`를 만들고 `src/components/ui/index.ts` 및 `src/index.ts`에서 다시 export 해주세요.
