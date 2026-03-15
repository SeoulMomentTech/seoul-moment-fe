# 브랜드 이벤트 상세 관리 PRD

## 1. 개요
브랜드 프로모션 이벤트의 상세 정보를 등록하고 수정할 수 있는 관리자 페이지입니다. 여러 개의 섹션(기본 정보, 배너, 팝업, 공지, 쿠폰 등)으로 이루어진 복잡한 폼을 다루며, 사용자가 직관적으로 데이터를 입력하고 검증할 수 있도록 제공하는 것을 목표로 합니다.

## 2. 페이지 구성 및 라우팅

### 2.1 이벤트 등록 페이지 (`/brand/promotion/add`)
- **목적**: 새로운 브랜드 프로모션을 생성합니다.
- **주요 기능**: 빈 폼을 제공하며, 모든 필수 데이터를 입력받아 한 번에 생성(Create) 요청을 보냅니다.

### 2.2 이벤트 수정 페이지 (`/brand/promotion/edit/:id`)
- **목적**: 기존 등록된 브랜드 프로모션의 상세 정보를 조회하고 수정합니다.
- **주요 기능**: 기존 데이터를 패칭하여 폼의 초기값(Default Values)으로 설정하고, 변경된 요소들에 대해 개별 혹은 전체 수정(Update/Patch) 요청을 보냅니다.

## 3. 폼 상세 명세 및 검증 (Validation)

폼은 관리의 용이성을 위해 논리적인 섹션으로 구분됩니다. `react-hook-form`과 `zod`를 사용하여 유효성 검사를 수행합니다.

### 3.1 기본 정보 (Basic Info)
- **`brandId`**: (필수) 셀렉트 박스. 전체 브랜드 리스트에서 선택. (검증: 필수 선택)
- **`brandDescriptionLanguage`**: (필수) 다국어 지원 여부 및 언어 코드.
- **`isActive`**: (필수) 이벤트 활성화 여부 (토글 스위치 형태).

### 3.2 배너 (Banner)
- **`bannerImage`**: (필수) 메인 배너 이미지. (검증: 파일 크기 5MB 이하, 포맷 JPG/PNG/WEBP)
- **`bannerLink`**: (선택) 배너 클릭 시 이동할 URL. (검증: 유효한 URL 포맷)

### 3.3 섹션 (Sections - 배열 데이터)
- **구성**: 프로모션 내 여러 하위 섹션을 동적으로 추가/삭제. (`useFieldArray` 활용)
- **`sectionTitle`**: (필수) 섹션 제목 (검증: 최소 1자, 최대 50자).
- **`sectionItems`**: (필수) 해당 섹션에 포함될 상품 목록 또는 이미지 리스트. 최소 1개 이상 등록 필요.

### 3.4 팝업 (Popup)
- **`hasPopup`**: (선택) 팝업 활성화 여부.
- **`popupImage`**: (활성화 시 필수) 팝업 노출 이미지.
- **`popupDuration`**: (활성화 시 필수) 노출 기간 (시작일~종료일). (검증: 시작일이 종료일보다 이전이어야 함)

### 3.5 공지 (Notice) & 쿠폰 (Coupon)
- **`noticeText`**: (선택) 프로모션 하단 유의사항 텍스트.
- **`couponList`**: (선택) 발급 가능한 쿠폰 ID 리스트.

## 4. 기술 스택 및 구현 전략

### 4.1 상태 관리 및 폼 핸들링
- **`react-hook-form`**: 복잡한 폼의 렌더링을 최적화하고 상태를 효율적으로 관리합니다.
- **`zod`**: 스키마 기반의 강력한 타입 추론 및 유효성 검사를 적용하여, 일관된 에러 처리 로직을 구현합니다.
- **`useFieldArray`**: 섹션 리스트 등 동적으로 항목이 늘어나는 폼을 효율적으로 렌더링하고 상태를 추적합니다.

### 4.2 컴포넌트 분리 전략
유지보수와 재사용성을 극대화하기 위해 UI를 기능별로 캡슐화합니다.
- `PromotionForm` (최상위 폼 컴포넌트 및 Context Provider 역할)
  - `PromotionBasicInfoSection`
  - `PromotionBannerSection`
  - `PromotionDynamicSection` (배열 아이템 렌더링)
  - `PromotionPopupSection`
- **UI 라이브러리**: `@seoul-moment/ui` 내의 공용 컴포넌트(Input, Select, Button, Switch 등)를 적극적으로 활용합니다.

### 4.3 UI/UX 및 피드백
- **에러 표시**: 입력 폼 하단에 Zod에서 발생한 에러 메시지를 명확한 텍스트(예: 붉은색)로 노출합니다.
- **진행 상태**: API 요청(저장/수정) 중에는 Button 내부에 로딩 스피너를 표시하여 중복 클릭을 방지합니다.
- **결과 피드백**: 저장 성공 또는 실패 시 `Toast` UI를 통해 사용자에게 즉각적인 결과를 알립니다.

## 5. API 연동 상세화

### 5.1 데이터 패칭 (조회)
- **브랜드 리스트 (등록/수정 공통)**: `useAdminBrandListQuery`
  - 등록 및 수정 페이지 진입 시 가장 먼저 호출되어 옵션 목록을 구성합니다.
- **프로모션 상세 (수정 페이지 한정)**: `useBrandPromotionDetailQuery`
  - `:id`를 기반으로 데이터를 조회한 뒤, `react-hook-form`의 `reset(data)` 함수를 호출해 폼의 기본값(Default Values)을 세팅합니다.
  - 데이터 패칭 중에는 화면의 깜빡임을 줄이기 위해 Skeleton UI 또는 Loading Spinner를 노출합니다.

### 5.2 데이터 뮤테이션 (생성/수정)
- **생성 (Create)**: `useCreateBrandPromotionMutation`
  - 모든 폼 요소의 유효성 검증을 통과한 데이터를 모아 단일 Payload로 서버에 전송합니다.
- **수정 (Update/Patch)**:
  - 변경된 사항에 대해 하위 도메인별 Patch Mutation을 호출합니다 (`usePatchBrandPromotionBannerMutation`, `useUpdateBrandPromotionSectionMutation` 등).
  - 여러 개의 API 호출이 필요한 경우, `Promise.all` 등을 활용하여 비동기 통신을 제어하고 에러 발생 시의 예외 처리(Fallback) 로직을 수립합니다.
