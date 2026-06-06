# Comparison Checklist

verify-against-figma 스킬에서 사용하는 3축 검증의 상세 체크리스트입니다.

---

## A. 스크린샷 비교 체크리스트

육안 비교 시 다음 항목을 우선 검사합니다.

### 레이아웃 & 정렬
- [ ] 주요 컨테이너의 max-width / 가로 정렬 (좌·우·중앙)
- [ ] 헤더 / 본문 / 푸터 영역의 세로 분할 비율
- [ ] 카드·리스트 아이템의 정렬 방향 (수직/수평) 및 간격

### Spacing
- [ ] 컨테이너 padding 좌우/상하 균형
- [ ] 요소 간 gap (특히 VStack/HStack의 `gap` 값이 디자인과 일치하는지)
- [ ] 섹션 간 큰 여백 (보통 16/24/32/48 단위)

### 시각 요소
- [ ] 이미지의 종횡비, object-fit (cover/contain) 결과
- [ ] 텍스트 줄바꿈 위치 (특히 다국어 ko/en/zh-TW 차이)
- [ ] 그림자(box-shadow), 보더 색상·두께·radius
- [ ] 아이콘 크기와 정렬 (lucide-react 기본 크기 24, 디자인이 16/20인 경우 명시 필요)

### 누락/추가
- [ ] Figma에는 있는데 구현에 없는 요소
- [ ] 구현에만 있는 잔존 요소 (개발 중 placeholder가 남은 경우)

---

## B. Computed Style 검증 가이드

### 검사 대상 우선순위

DOM 트리 전체를 검사하면 비효율적이므로 다음 순서로 좁힙니다.

1. **페이지 root** (`<main>` 또는 layout 컨테이너): background, max-width, padding
2. **주요 헤더** (`<header>`, 페이지 타이틀): font-size, line-height, color, font-weight
3. **주요 인터랙션 요소** (Button, Link, TabsTrigger): background, color, border, padding, hover 상태(필요 시)
4. **카드/리스트 아이템**: background, border-radius, gap, padding
5. **본문 텍스트**: font-size, line-height, color, letter-spacing

### 자주 어긋나는 속성 Top 10

| 속성 | 자주 어긋나는 이유 |
| :--- | :--- |
| `line-height` | Figma의 line-height는 px 또는 % 단위, Tailwind는 unitless. 토큰 미적용 시 차이 발생 |
| `letter-spacing` | Figma의 negative tracking이 누락되는 경우 |
| `gap` | margin 기반으로 잘못 구현되어 token gap이 누락 |
| `font-weight` | 500/600 차이가 시각적으로 미묘 |
| `border-radius` | 4/6/8/12 단위 혼용 |
| `box-shadow` | 다중 shadow 누락, opacity 차이 |
| `color` (문자) | `text-foreground`(#171717) vs `text-neutral`(#707070) 혼용 |
| `background` | `bg-surface-soft`(#F0F6FF) vs `bg-white` 혼용 |
| `padding` | container vs item padding이 합쳐져서 의도 이상으로 커지는 경우 |
| `width` (컨테이너) | max-width 누락으로 데스크톱에서 늘어짐 |

### Computed Style 수집 코드 예시

chrome-devtools `evaluate`에서 사용:

```js
const el = document.querySelector('[data-testid="article-title"]');
const cs = getComputedStyle(el);
({
  fontSize: cs.fontSize,
  lineHeight: cs.lineHeight,
  fontWeight: cs.fontWeight,
  color: cs.color,
  letterSpacing: cs.letterSpacing,
});
```

여러 요소를 한 번에 조회:

```js
const targets = ['main', 'header', 'h1', '[role="button"]'];
targets.flatMap(sel => 
  Array.from(document.querySelectorAll(sel)).slice(0, 3).map(el => {
    const cs = getComputedStyle(el);
    return {
      selector: sel,
      fontSize: cs.fontSize,
      color: cs.color,
      background: cs.backgroundColor,
      padding: cs.padding,
      gap: cs.gap,
      borderRadius: cs.borderRadius,
    };
  })
);
```

---

## Tailwind v4 토큰 빠른 매핑표

자주 등장하는 Figma hex 값을 프로젝트 토큰으로 매핑할 때 참고합니다. 자세한 내용은 `.claude/skills/figma-to-code/references/tailwind-v4-pattern.md`를 우선 참조하세요.

### 색상 (대표값)

| Figma hex | Tailwind 토큰 | 용도 |
| :--- | :--- | :--- |
| `#f37b2a` | `text-brand` / `bg-brand` / `border-brand` | 브랜드 강조 |
| `#171717` | `text-foreground` | 강한 본문 텍스트 |
| `#707070` | `text-neutral` | 기본 본문 텍스트 |
| `#DDDDDD` | `border-neutral-subtle` | 옅은 보더 |
| `#F0F6FF` | `bg-surface-soft` | 강조 배경 |
| `#0088FF` | `text-info` / `bg-info` | 정보 |
| `#FF383C` | `text-danger` / `bg-danger` / `text-error` | 오류·경고 |
| `#FFFFFF` | `bg-white` 또는 `text-neutral-0` | 기본 배경 |

### 타이포그래피

| Figma 스타일 | Tailwind 클래스 | 크기 |
| :--- | :--- | :--- |
| Title 1 | `text-title-1` | 36px |
| Title 2 | `text-title-2` | 32px |
| Title 3 | `text-title-3` | 24px |
| Title 4 | `text-title-4` | 20px |
| Body 1 | `text-body-1` | 18px |
| Body 2 | `text-body-2` | 16px |
| Body 3 | `text-body-3` | 14px |
| Body 4 | `text-body-4` | 13px |
| Body 5 | `text-body-5` | 12px |

검증 중 위 토큰을 쓰지 않은 px/hex 값이 발견되면 **토큰 위반**으로 플래그합니다.

---

## C. Viewport별 검증 포인트

### Mobile (375 × 812)
- [ ] **Overflow-x**: 가로 스크롤이 발생하지 않는지 (`document.documentElement.scrollWidth > 375` 검사)
- [ ] **Fixed bottom 영역**: 하단 고정 버튼·CTA가 키보드/스크롤과 겹치지 않는지
- [ ] **Font 축소**: desktop에서 `text-title-1`(36px)을 mobile에서 그대로 쓰면 깨짐. 반응형 토큰(`md:text-title-1` 등) 적용 여부
- [ ] **터치 타겟**: 버튼/링크 hit area가 최소 44×44 (`web.dev` 권장)
- [ ] **이미지 크기**: 대형 이미지가 mobile에서 viewport를 넘지 않는지

### Tablet (768 × 1024)
- [ ] **그리드 컬럼 전환 지점**: `md:` breakpoint(768px) 이후 컬럼 수가 디자인과 일치하는지
- [ ] **사이드바 표시**: admin은 768 이상에서 사이드바가 표시되는지
- [ ] **본문 max-width**: 컨텐츠가 너무 넓어지지 않는지

### Desktop (1280 × 800)
- [ ] **Container max-width**: `max-w-screen-xl` 또는 디자인 시스템 max-width 적용 여부
- [ ] **레이아웃 분할**: 2-3 컬럼 레이아웃의 비율이 디자인과 일치하는지
- [ ] **헤더 sticky**: 디자인 의도대로 sticky/fixed 동작하는지

---

## 보고 시 분류 규칙

각 항목은 다음 3단계로 분류합니다.

- ✅ **일치**: 차이 없음 또는 무시 가능 수준 (1-2px 미만)
- ⚠️ **차이**: 사용자 인지 가능 수준의 차이. 토큰 미스매치, spacing 어긋남, 색상 톤 차이 등
- ❌ **누락**: 디자인에 있어야 할 요소가 구현되지 않았거나, 반대로 디자인에 없는 요소가 추가됨

리포트의 "심각도 높은 이슈"는 ❌과 ⚠️ 중 토큰 위반·레이아웃 깨짐을 포함합니다. 그 외 미세한 spacing 차이는 "사소한 차이"로 분류합니다.
