# Admin UI 개발 워크플로우 가이드 (Dual-Agent System)

이 문서는 `admin-ui-designer`와 `admin-specialist` 에이전트를 효과적으로 활용하여 고품질의 Admin UI를 개발하는 표준 워크플로우를 정의합니다.

## 1. 역할 분담 (Role Definition)

| 에이전트 | 주요 역할 | 핵심 기술 스택 |
| :--- | :--- | :--- |
| **admin-ui-designer** | **Presentation Layer (View)**<br>피그마 디자인 변환, 레이아웃 구성, 디자인 시스템 적용 | `@seoul-moment/ui`, Tailwind v4, Lucide Icons |
| **admin-specialist** | **Business Logic (Container)**<br>상태 관리 연결, API 통신, 복잡한 비즈니스 로직 구현 | Zustand, TanStack Query, React Hook Form |

## 2. 표준 워크플로우 (Step-by-Step)

### [Step 1] UI 뼈대 생성 (`admin-ui-designer`)
- **목적**: 디자인 시스템을 준수하는 "순수 UI 컴포넌트(Dumb Component)" 제작
- **방법**: 피그마 URL 또는 상세 설명을 제공하여 뷰 코드를 먼저 생성합니다.
- **핵심 지침**: 
  - 상태값이나 API 호출을 내부에 포함하지 않습니다.
  - 모든 데이터와 이벤트 핸들러는 `Props`로 받도록 설계합니다.
  - 레이아웃은 반드시 `@seoul-moment/ui`의 `VStack`, `HStack`을 사용합니다.

### [Step 2] 로직 연결 및 컨테이너화 (`admin-specialist`)
- **목적**: 생성된 UI에 실제 기능을 부여하고 데이터 흐름을 완성
- **방법**: 완성된 UI 파일 경로를 알려주고, 필요한 상태 관리와 API 연동을 지시합니다.
- **핵심 지침**:
  - `admin-ui-designer`가 만든 파일을 가급적 수정하지 않고, 상위 컨테이너에서 로직을 주입합니다.
  - 전역 상태(Zustand)와 서버 상태(TanStack Query)를 적절히 배분하여 연결합니다.

## 3. 사용 예제 (Example Prompt)

### 🎨 UI 생성 요청 시 (To: admin-ui-designer)
> "@admin-ui-designer, [피그마 URL] 참고해서 '회원 상세 정보' 폼 UI를 만들어줘. 
> 파일은 `apps/admin/src/pages/user/UserDetailView.tsx`에 생성해주고, 
> 로직 없이 Props로 데이터와 저장 함수만 받는 형태로 짜줘."

### ⚙️ 로직 연결 요청 시 (To: admin-specialist)
> "@admin-specialist, 방금 만든 `UserDetailView.tsx`에 로직을 붙여줘. 
> `useUserStore`에서 데이터를 가져오고, 저장 버튼 클릭 시 `useUpdateUser` 뮤테이션을 실행하는 컨테이너 컴포넌트를 `UserDetailPage.tsx`로 만들어줘."

## 4. 기대 효과
1. **코드 품질 향상**: 뷰와 로직이 자연스럽게 분리되어 유지보수가 쉬워집니다.
2. **디자인 일관성**: 전문 디자이너 에이전트가 디자인 시스템을 엄격히 준수합니다.
3. **개발 속도**: 에이전트가 각자의 전문 분야에만 집중하므로 오류가 적고 처리 속도가 빠릅니다.
