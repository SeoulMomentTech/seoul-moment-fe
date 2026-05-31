# Terms of Service 컴포넌트 설계

- 날짜: 2026-05-31
- 대상 앱: `apps/web` (Next.js 15, App Router, FSD)
- 원문: `首爾映像有限公司平台服務條款` (번체 중국어, 최종 갱신 2024-11-26)

## 목표

플랫폼 서비스 약관(TOS) 본문을 한 곳에 정의하고, 프로젝트 내 여러 위치
(전용 페이지 · 약관 동의 모달 · Footer 링크)에서 재사용 가능하도록 컴포넌트를 만든다.

## 결정 사항

| 항목 | 결정 |
| --- | --- |
| 언어 | zh-TW 본문을 모든 로케일에서 노출 (ko/en은 zh-TW 폴백) |
| 노출 위치 | 전용 페이지 `/terms` + 약관 동의 모달 + Footer 링크 |
| 콘텐츠 형식 | JSX 하드코딩 (구조형 본문을 헬퍼 컴포넌트로 표현) |
| Footer 라우트 | 기존 `/policy` 링크 유지 + `/terms` 링크 별도 추가 |

## 아키텍처 (FSD)

### 1. 핵심 재사용 컴포넌트 — `shared` 레이어

**`src/shared/ui/terms-of-service-content.tsx`** → `TermsOfServiceContent`

- 번체 중국어 약관 전체를 JSX로 하드코딩한 프레젠테이션 컴포넌트.
- 파일 내부 로컬 헬퍼로 가독성 확보:
  - `Section` — 대제목 + 본문 블록
  - `SubSection` — 소제목
  - `Bullets` — `ul`/`li` 리스트
- 본문 구조(원문 순서 유지):
  1. 服務說明 (服務範圍 / 服務性質 / 實際交易平台 / 本公司角色 / 服務調整權利)
  2. 交易條款 (交易流程與契約成立 / 第三方電商平台交易規範 / 付款方式 / 配送服務 / 消費者權益保障 / 退貨流程 / 商品瑕疵 / 平台 관계 / 平台間 資訊差異 / 客戶服務)
  3. 付款說明 (付款處理 / 付款方式 / 發票開立)
  4. 退貨與退款 (退貨管道 / 退款處理 / 退貨條件及限制)
  5. 個人資料保護與隱私權 (本平台 蒐集 / 不蒐集 交易資料 / 第三方 個人資料)
  6. 智慧財產權
  7. 免責聲明 (資訊正確性 / 價格變動 / 庫存狀況 / 第三方平台服務 / 導購服務性質 / 賣家身分 / 責任限制)
  8. 條款修改與通知
  9. 爭議處理與準據法 (客戶服務 / 爭議處理機制 / 條款解釋 / 準據法與管轄法院)
  10. 公司資訊
  11. 其他重要事項 (電子文件效力 / 交易紀錄 / 契約移轉 / 完整合意)
  12. 最後更新日期: 2024年11月26日
- 디자인 토큰 사용: `text-body-3`, `text-foreground`, `text-black/60`, `VStack`(@seoul-moment/ui).
- 이 컴포넌트 하나를 전용 페이지와 모달에서 공통 소비한다.

### 2. 전용 페이지 — `/terms`

- `src/app/[locale]/terms/page.tsx` → `<TermsPage />` 렌더 (contact 라우트 패턴 동일)
- `src/views/terms/index.tsx` (배럴) + `src/views/terms/ui/TermsPage.tsx`
  - 제목 헤더(`服務條款`) + 본문 컨테이너 레이아웃 안에 `TermsOfServiceContent` 렌더.

### 3. 모달 노출

- `src/shared/ui/terms-consent.tsx`: 회원가입 동의 UI의 `termsOfService` 모달 본문에서
  `"약관 내용입니다."` 플레이스홀더를 `<TermsOfServiceContent />`로 교체.
  - `privacyPolicy`는 원문 미제공 → 플레이스홀더 유지 (후속 작업).
- `src/features/login/ui/LoginTerms.tsx`: `會員條款` 링크를 `/terms`로 연결
  (`@/i18n/navigation`의 `Link` 사용).

### 4. Footer 링크

- `src/widgets/footer/ui/Footer.tsx`: 기존 `/policy` 링크는 그대로 두고,
  `/terms` 링크(`t("terms")`)를 추가.
- i18n 라벨 키 `terms` 추가:
  - `zh-TW`: `服務條款`
  - `ko`: `Terms` (또는 추후 번역)
  - `en`: `Terms`

## 데이터 흐름

정적 콘텐츠(서버 측 변동 없음). API 호출 없음. `TermsOfServiceContent`는 순수
프레젠테이션 컴포넌트이며 props를 받지 않는다(현 단계). 페이지/모달은 동일 컴포넌트를
서로 다른 컨테이너에 끼워 넣는다.

## 에러 처리 / 엣지

- 정적 렌더이므로 런타임 에러 경로 없음.
- 모달은 긴 본문 → 기존 `TermsModal`의 `overflow-y-auto` 스크롤 영역에 의존.
- 전용 페이지도 긴 본문을 자연 스크롤.

## 테스트

- 렌더 스모크 테스트(Vitest): `TermsOfServiceContent`가 주요 섹션 제목을 렌더하는지 확인.
- 라우트 접근(`/terms`) 수동 확인.

## 비고 / 후속

- i18n 메시지는 Google Sheets에서 동기화(`pnpm i18n:sync`)되므로, `terms` 키는
  로컬 추가 후 다음 동기화 때 덮어쓰일 수 있음 → 시트에도 `terms` 키 등록 필요(팀 공유).
- Privacy Policy(隱私權政策) 원문이 제공되면 동일 패턴으로 `PrivacyPolicyContent` 추가 가능.
- ko/en 약관 번역본 확보 시, `TermsOfServiceContent`를 로케일 분기 또는 i18n 기반으로 전환 가능
  (현 구조는 본문 컴포넌트 교체만으로 확장 가능하도록 분리해 둠).
