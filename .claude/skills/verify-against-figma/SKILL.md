---
name: verify-against-figma
description: 구현된 화면을 Figma 디자인과 대조해 스크린샷, 디자인 토큰/computed style, 반응형 viewport 3축으로 검증합니다. figma-remote-mcp와 chrome-devtools-mcp를 조합해 사용합니다.
---

# Verify Against Figma Skill

이 스킬은 이미 구현된 화면이 Figma 디자인과 얼마나 일치하는지 자동 검증하는 가이드입니다. `figma-to-code` 스킬로 만든 결과뿐 아니라, 기존에 구현된 임의의 화면에도 단독으로 사용할 수 있습니다.

## 0. 필수 참조 문서 (References)
검증을 시작하기 전에 **반드시** 아래 문서를 확인하세요.
- **[Comparison Checklist]**: `.claude/skills/verify-against-figma/references/comparison-checklist.md` (3축 검증 체크리스트, 자주 어긋나는 속성, viewport별 검증 포인트)

함께 참조하면 좋은 문서 (figma-to-code 스킬에 정의됨):
- `tailwind-v4-pattern.md` — Tailwind v4 토큰 매핑 기준
- `ui-components-pattern.md` — `@seoul-moment/ui` 레이아웃 컨벤션

## 1. 입력

스킬 호출 시 다음 정보를 받습니다.
- **Figma URL** 또는 (`fileKey` + `nodeId`)
- **검증 대상 라우트** (예: `/article/123`, `/admin/users`)
- **앱 식별** (`web` | `admin`) — 작업 컨텍스트에서 추론하거나 사용자에게 확인. 기본값 `web`

기본 dev URL은 자동으로 합성합니다.
- `web` → `http://localhost:3000{route}`
- `admin` → `http://localhost:5173{route}`

사용자가 다른 URL을 명시하면 그 값을 우선 적용합니다.

## 2. 사전 점검

1. `mcp__chrome-devtools__navigate_page`로 합성된 dev URL에 접근을 시도합니다.
2. 응답이 없거나 ECONNREFUSED 에러면 **dev 서버가 꺼진 것**으로 판단하고, 사용자에게 다음 명령 중 하나를 실행하도록 안내합니다.
   - `pnpm --filter @seoul-moment/web dev`
   - `pnpm --filter @seoul-moment/admin dev`
3. **스킬이 직접 dev 서버를 띄우지 않습니다.** 사용자가 서버 상태를 통제하도록 합니다.

## 3. 검증 절차 (3축)

### A. 스크린샷 비교
1. `mcp__figma-remote-mcp__get_screenshot`으로 Figma 디자인을 캡처합니다.
2. `mcp__chrome-devtools__take_screenshot`으로 데스크톱 viewport (1280px) 기준 실제 화면을 캡처합니다.
3. 두 이미지를 나란히 비교해 다음 차이를 자연어로 보고합니다.
   - 레이아웃·정렬 차이
   - spacing(margin/padding/gap) 시각적 갭
   - 색상 톤 차이 (정밀 비교는 B축에서 수행)
   - 누락된 요소나 추가된 요소

### B. 디자인 토큰 / computed style
1. `mcp__figma-remote-mcp__get_variable_defs`로 디자인에 사용된 변수 목록을 확보합니다.
2. `mcp__figma-remote-mcp__get_design_context`로 노드별 스타일 정보를 추가 수집합니다.
3. chrome-devtools `evaluate`를 사용해 핵심 DOM 요소들의 `getComputedStyle()` 결과를 수집합니다. 우선순위는 `comparison-checklist.md`를 따릅니다.
4. 다음 표 형식으로 일치 여부를 정리합니다.

   | 요소 | 속성 | Figma 기대값 | 실제 computed | 토큰 매핑 | 결과 |
   | :--- | :--- | :--- | :--- | :--- | :--- |
   | `[data-testid="article-title"]` | font-size | 24px | 24px | `text-title-3` | ✅ |
   | `<button class="primary">` | background | `#f37b2a` | `#f37b2a` | `bg-brand` 미사용 (하드코딩) | ⚠️ |

5. 하드코딩된 hex/px가 발견되면 토큰 위반으로 플래그하고, `tailwind-v4-pattern.md`에서 적절한 토큰을 제시합니다.

### C. 반응형 viewport
1. Figma 파일에 mobile / tablet / desktop 프레임이 분리되어 있으면 각 노드를 캡처합니다. (없으면 desktop만 검증하고 그 사실을 명시)
2. `mcp__chrome-devtools__browser_resize`로 viewport를 다음 순서대로 변경하며 실제 화면을 캡처합니다.
   - mobile: 375 × 812
   - tablet: 768 × 1024
   - desktop: 1280 × 800
3. 각 viewport에서 A·B축과 동일한 항목을 검사합니다. mobile 특화 이슈(overflow-x, fixed bottom 영역, font 축소)는 체크리스트를 참조합니다.

## 4. 결과 리포트 포맷

검증이 끝나면 다음 형식으로 리포트를 작성합니다.

```markdown
# Verify Report — [페이지명] (route)

## A. 스크린샷 비교
- ✅ 일치: ...
- ⚠️ 차이: 
  - [위치] [기대값] → [실제값] / 권장 수정

## B. 디자인 토큰 / Computed Style
| 요소 | 속성 | Figma | 실제 | 결과 |
| ... |
- 토큰 위반: N건
- 일치: M건

## C. 반응형
- mobile (375): ...
- tablet (768): ...
- desktop (1280): ...

## 요약
- 심각도 높은 이슈: N건
- 사소한 차이: M건
- 다음 액션 제안: ...
```

각 차이 항목은 다음 정보를 포함합니다.
- 위치 (요소 셀렉터 또는 스크린샷 영역 설명)
- 기대값 (Figma)
- 실제값 (브라우저)
- 권장 수정안 (토큰명 또는 코드 변경 방향)

## 5. 한계

- **A11y, 인터랙션, 애니메이션은 이 스킬 범위 밖입니다.** 필요 시 `chrome-devtools-mcp:a11y-debugging` 스킬을 별도로 실행하세요.
- chrome-devtools-mcp가 브라우저 앱 권한 부족 등의 이유로 클릭/타이핑이 막혀 있으면 정적 화면 검증만 가능합니다. 이 경우 리포트 상단에 명시합니다.
- Figma 파일에 디자인 변수가 정의되어 있지 않거나 raw hex만 사용된 경우 B축 비교의 정확도가 떨어집니다. 이때는 스크린샷 비교(A축) 결과에 무게를 둡니다.
