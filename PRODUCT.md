# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

한국 브랜드의 패션·라이프스타일 상품과 그 배경 이야기를 함께 찾는 소비자. 대만/중화권 방문자가 1차 대상이고(zh-TW 로케일, `api.seoulmoment.com.tw` 도메인, 배송 안내가 "대만 내 배송" 기준), 영어권과 한국어 사용자가 함께 온다. `defaultLocale`은 `en`이다.

방문자는 두 가지 상태로 섞여 들어온다: **둘러보러 온 사람**(매거진·아티클·룩북·뉴스를 읽다가 상품으로 넘어감)과 **사려고 온 사람**(카테고리 필터·검색으로 특정 상품을 찾음). 같은 세션 안에서 두 상태를 왕복한다.

별도 오디언스: `apps/admin` 백오피스를 쓰는 내부 운영자.

## Product Purpose

한국 브랜드를 상품 목록이 아니라 **맥락과 함께** 소개한다. 상품(product·brand)과 편집 콘텐츠(magazine·article·news·lookbook·promotion·partner)가 같은 비중으로 존재하는 것이 이 제품의 구조적 특징이며, 성공은 "콘텐츠를 읽다가 상품을 이해하고 사게 되는" 경로가 실제로 작동하는 것이다.

## Positioning

커머스 카탈로그와 편집 매체가 분리돼 있지 않다. 브랜드마다 매거진·룩북·뉴스가 붙고, 프로모션은 온라인 이벤트와 오프라인 팝업을 함께 다룬다. 순수 커머스 사이트는 이 맥락을 못 주고, 순수 미디어는 구매로 연결하지 못한다.

## Operating Context

- **라우팅**: 모든 라우트가 `[locale]` prefix를 가진다(`localePrefix: "always"`). locales = `ko`, `en`, `zh-TW`.
- **카피 SSOT는 Google Sheets다.** `language-pack` 탭 → `scripts/syncLocaleFromSheet.js` → `src/i18n/messages/{ko,en,zh-TW}.json`을 **통째로 덮어쓴다**. `pnpm dev`가 매번 이 sync를 먼저 실행한다. 즉 **JSON을 손으로 고치면 안 되고**, 새 문자열은 시트에 행으로 들어가야 한다. 스크립트는 `GOOGLE_SERVICE_ACCOUNT_JSON` 없이는 throw하므로, 자격증명이 없는 개발자는 이 경로를 우회할 수단이 필요하다.
- **API**: `https://api.seoulmoment.com.tw`. `languageCode`를 쿼리로 넘기면 `Accept-Language` 헤더로 변환된다(GET 한정).
- 기존 문의 채널: `/contact` 페이지의 문의 폼 + Kakao/LINE QR. 실시간 상담 채널은 없다.
- 계측: Sentry(세션 리플레이 포함), Microsoft Clarity, Google Analytics, AdSense.

## Capabilities and Constraints

**확정된 기능 영역**: 상품(목록·상세·카테고리 필터·좋아요·최근 본), 브랜드, 매거진/아티클, 뉴스, 룩북, 프로모션(온라인 이벤트 + 오프라인 팝업), 파트너, 검색, 마이페이지(프로필·사이즈 정보·관심 카테고리), 인증.

**인증**: 이메일 + Google SNS만. Apple/Kakao/Naver는 **미구현**이며 있는 것으로 가정해선 안 된다.

**챗봇 어시스턴트** (이번에 추가):
- 성격은 **복합 어시스턴트** — 상품 추천, 주문·배송 문의, 콘텐츠 추천을 모두 다룬다.
- 사이트 전역에서 접근 가능해야 한다.
- **대화 API는 아직 없다.** 현 단계 응답은 mock이며, 실제 엔드포인트·모델·세션 정책은 **미정**이다. 어시스턴트가 실제 주문 데이터를 조회할 수 있는지도 미정 — 그래서 주문 관련 답변은 마이페이지로 안내하고, 안내가 참고용임을 명시한다.
- 무인 상담 실패 시 에스컬레이션 대상은 기존 `/contact` 문의 채널.

**제약**: 다크 모드는 존재하지 않는다. ko/en/zh-TW 문자열 길이 차가 크다(이 메시지 세트에서 ko→en 5~6배 사례 다수) — 고정폭 레이아웃을 쓸 수 없다.

## Brand Commitments

- 제품명 **Seoul Moment**.
- **챗봇 어시스턴트의 화면상 이름은 "Seoul Moment"다.** 별도 페르소나 이름이나 캐릭터를 만들지 않는다 — 브랜드가 직접 답하는 톤이다.
- 아이콘은 `lucide-react` 단독. 다른 아이콘 라이브러리를 추가하지 않는다.
- 폰트는 Pretendard.

## Evidence on Hand

- 실 상품·브랜드·콘텐츠 데이터는 dev API에서 온다. **파트너 카테고리는 dev에서 0건**이라 로컬에서 항상 Empty로 보인다.
- 이미지 호스트 화이트리스트: `images.unsplash.com`, `image-dev.seoulmoment.com.tw`, `www.figma.com` (`next.config.ts`).
- **없는 것 — 만들어내면 안 됨**: 고객 후기/리뷰 본문, 판매량·트래픽 수치, 가격 정책, 실제 주문 데이터, 상담원 응답 시간 SLA. 챗봇 mock에 들어가는 상품·콘텐츠는 시연용이며 그렇게 취급한다.

## Product Principles

1. **콘텐츠와 상품은 동급이다.** 어느 한쪽을 다른 쪽의 장식으로 만들지 않는다. 어시스턴트도 상품만 파는 것이 아니라 읽을거리를 함께 제안한다.
2. **3개 로케일이 1급 제약이다.** 레이아웃·카피·컴포넌트는 최장 문자열에서 먼저 검증한다.
3. **한국어 입력이 기본 경로다.** IME 조합 중 동작(Enter·길이 제한·값 변환)은 사후 보정이 아니라 최초 설계에 포함한다.
4. **모르는 것은 안내하지 않는다.** 어시스턴트가 조회할 수 없는 정보는 확정된 사실처럼 말하지 않고 실제 확인 경로(마이페이지·문의)로 넘긴다.
5. **카피는 시트가 소유한다.** 코드가 문자열의 최종 소유자가 되는 상태를 영구화하지 않는다.

## Accessibility & Inclusion

전역 스타일이 `*`에 `focus-visible:outline-none` + `ring-transparent`를 걸어 **포커스 링이 앱 전체에서 비활성**이다(`apps/web/src/app/globals.css`). 신규 인터랙티브 표면은 자체 포커스 표시를 반드시 제공해야 하며, 이것이 현재 알려진 최대 접근성 부채다.

키보드 단독 사용과 스크린리더 지원을 신규 작업의 기본 요구로 둔다. 별도로 요구되는 준수 표준은 아직 **미정**.
