# 브랜드 이벤트 상세 관리 PRD

## 1. 개요
브랜드 프로모션 이벤트의 상세 정보를 등록하고 수정할 수 있는 관리자 페이지입니다. 사용자(Web) 화면에 노출되는 복합적인 섹션(배너, 룩북, 팝업, 상품, 이벤트 쿠폰, 공지 등)을 관리하기 위한 폼으로 구성되며, 사용자가 직관적으로 데이터를 입력하고 검증할 수 있도록 제공하는 것을 목표로 합니다.

## 2. 페이지 구성 및 라우팅

### 2.1 이벤트 등록 페이지 (`/brand/promotion/add`)
- **목적**: 새로운 브랜드 프로모션을 생성합니다.
- **주요 기능**: 빈 폼을 제공하며, 모든 필수 데이터를 입력받아 한 번에 생성(Create) 요청을 보냅니다.

### 2.2 이벤트 수정 페이지 (`/brand/promotion/edit/:id`)
- **목적**: 기존 등록된 브랜드 프로모션의 상세 정보를 조회하고 수정합니다.
- **주요 기능**: `GetBrandPromotionResponse`와 동일한 규격의 데이터를 패칭하여 폼의 초기값(Default Values)으로 설정하고, 변경된 요소들에 대해 개별 혹은 전체 수정(Update/Patch) 요청을 보냅니다.

## 3. 폼 상세 명세 및 검증 (Validation)

폼은 Web 클라이언트의 노출 구조에 맞춰 논리적인 섹션으로 구분됩니다. `react-hook-form`과 `zod`를 사용하여 유효성 검사를 수행합니다.

### 3.1 브랜드 기본 정보 (Brand Info)
- **`brandId`**: (필수) 전체 브랜드 리스트에서 선택.
- **`brandName`**: (필수) 브랜드 이름.
- **`profileImageUrl`**: (필수) 브랜드 프로필 이미지.
- **`description`**: (필수) 브랜드 소개 및 설명 (Web에서 텍스트 노드로 렌더링).
- **`colorCode`**: (필수) 브랜드 고유 배경 색상 코드 (예: `#FFFFFF`).

### 3.2 메인 배너 (Banner List)
- **`bannerList`**: 배열 형태 구성.
  - **`imageUrl`**: (필수) 데스크탑 배너 이미지.
  - **`mobileImageUrl`**: (필수) 모바일 배너 이미지.
  - **`linkUrl`**: (선택) 클릭 시 이동 URL.
  - **`title`**: (필수) 배너 제목.

### 3.3 룩북 섹션 (Section List - 배열 데이터)
- **`sectionList`**: 프로모션 내 룩북 등 다중 이미지 섹션. (`useFieldArray` 활용)
  - **`type`**: (필수) 섹션 노출 타입 (`TYPE_1` ~ `TYPE_5`).
  - **`title`**: (필수) 섹션 제목.
  - **`imageUrlList`**: (필수) 해당 룩북 섹션에 포함될 이미지 리스트.

### 3.4 스페셜 이벤트 상품 (Product List)
- **`productList`**: 프로모션에 노출할 스페셜 상품 목록.
  - 기존 등록된 상품 ID를 검색하여 추가하는 방식 제공.
  - (표시 데이터: `productName`, `brandName`, `price`, `imageUrl`, `like`, `review`, `reviewAverage`)

### 3.5 오프라인 팝업 (Popup List)
- **`popupList`**: 오프라인 행사 정보.
  - **`title` & `description`**: (필수) 팝업 제목 및 상세 설명.
  - **`place` & `address`**: (필수) 장소명 및 전체 주소.
  - **`latitude` & `longitude`**: (필수) 지도 표시를 위한 위경도 좌표.
  - **`startDate` & `startTime`**: (필수) 시작 일시.
  - **`endDate` & `endTime`**: (선택) 종료 일시. 없을 경우 상시.
  - **`imageUrlList`**: (필수) 팝업 현장 스와이퍼 이미지 리스트.

### 3.6 온라인 이벤트 및 쿠폰 (Event & Coupon List)
- **`eventList`**: 이벤트 및 발급 쿠폰 정보.
  - **`title`**: (필수) 이벤트 제목.
  - **`couponList`**: 이벤트 내 쿠폰 리스트.
    - **`title` & `description`**: 쿠폰명 및 혜택 설명.
    - **`imageUrl`**: 쿠폰 이미지.
    - **`status`**: 활성 여부 (예: `ACTIVE`, `EXPIRED`).

### 3.7 공지사항 (Notice List)
- **`noticeList`**: 하단 유의사항 목록.
  - **`content`**: (필수) 공지 내용 단위 (리스트 형태로 렌더링).

## 4. 기술 스택 및 구현 전략

### 4.1 상태 관리 및 폼 핸들링
- **`react-hook-form`**: 복잡한 폼의 렌더링 최적화 및 상태 관리.
- **`zod`**: 스키마 기반 유효성 검사를 통해 데이터 정합성 보장.
- **`useFieldArray`**: 배너, 섹션, 팝업, 쿠폰 등 동적으로 항목이 늘어나는 폼 처리.

### 4.2 컴포넌트 분리 전략
유지보수와 재사용성을 극대화하기 위해 UI를 기능별로 캡슐화합니다.
- `PromotionForm` (최상위 폼 컴포넌트 및 Context Provider 역할)
  - `PromotionBrandInfoSection`
  - `PromotionBannerSection`
  - `PromotionLookbookSection`
  - `PromotionProductSection`
  - `PromotionPopupSection`
  - `PromotionEventCouponSection`
  - `PromotionNoticeSection`

### 4.3 UI/UX 및 피드백
- **에러 표시**: 입력 폼 하단에 Zod 에러 메시지를 붉은 텍스트로 노출.
- **진행 상태**: API 요청 시 Button 내부 로딩 스피너로 중복 클릭 방지.
- **결과 피드백**: 저장/수정 성공 시 `Toast` UI 알림 제공.

## 5. API 연동 상세화

### 5.1 데이터 패칭 (조회)
- **브랜드 리스트**: `useAdminBrandListQuery` (등록/수정 시 브랜드 옵션 제공)
- **프로모션 상세 (수정 전용)**: `useBrandPromotionDetailQuery`
  - Web 클라이언트가 사용하는 `getBrandPromotionDetail` 응답 구조와 동일한 데이터를 패칭하여 폼 초기값(Default Values)으로 세팅.

### 5.2 데이터 뮤테이션 (생성/수정)
- **생성 (Create)**: `useCreateBrandPromotionMutation`
  - 폼 유효성 검증 완료 후 전체 Payload 단일 전송.
- **수정 (Update/Patch)**:
  - 폼 데이터가 방대하므로 하위 도메인별(배너, 팝업, 룩북, 상품 등) 개별 Patch Mutation을 지원하거나 전체 덮어쓰기 로직 구현.