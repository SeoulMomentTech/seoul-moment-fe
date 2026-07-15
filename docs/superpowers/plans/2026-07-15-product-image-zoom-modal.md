# 상품 상세 이미지 확대 모달 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 상품 상세 페이지에서 메인 이미지를 클릭하면 확대 모달(데스크톱 중앙 Dialog, 모바일 하단 full Drawer)이 열리고 슬라이드·핀치/더블탭 줌으로 이미지를 볼 수 있게 한다.

**Architecture:** 반응형 단일 컴포넌트 `ProductImageZoomModal`을 신규 작성하고, `useMediaQuery("(max-width: 640px)")`로 데스크톱은 `Dialog`, 모바일은 `Drawer(direction="bottom")`로 분기한다. 내부 이미지 뷰어는 기존에 쓰던 Swiper 11의 `Zoom`/`Navigation`/`Pagination` 모듈을 공유한다. `ProductGallery`가 모달의 열림 상태와 시작 인덱스를 소유하고, 메인 이미지 클릭 시 해당 슬라이드 인덱스로 모달을 연다.

**Tech Stack:** Next.js 16, React, TypeScript, Swiper 11 (Zoom/Navigation/Pagination), @seoul-moment/ui (Dialog/Drawer, Radix + vaul), next-intl, Vitest + Testing Library.

## Global Constraints

- FSD 하향 import 규칙 준수: `widgets → features → entities → shared`. 상위 레이어 import 금지.
- 라우팅/UI import: UI 컴포넌트는 `@seoul-moment/ui`에서만 가져온다. 아이콘은 `lucide-react`만 사용.
- import 순서는 `import/order` ESLint 규칙 엄격 적용 → 각 작업 종료 전 `pnpm lint:fix:web` 실행(포매터가 import를 재정렬/삭제할 수 있으니 이후 파일 재확인).
- i18n: 사용자 노출 문구는 `useTranslations()`로 처리하며 기존 키를 우선 재사용한다(`close` = "닫기" 존재).
- 반응형 브레이크포인트: 모바일 판정은 `(max-width: 640px)`(프로젝트 `max-sm`과 일치).
- 커밋 금지 브랜치: `develop` 직접 커밋 불가. 작업 브랜치는 `feat/product-image-zoom-modal`(이미 생성됨).
- 모든 명령은 `apps/web` 디렉터리 기준으로 실행한다.

---

### Task 1: `ProductImageZoomModal` 컴포넌트

확대 모달 자체. 데스크톱/모바일 분기, Swiper 줌 뷰어, 이미지 개수만큼 슬라이드 렌더.

**Files:**
- Create: `apps/web/src/widgets/product-gallery/ui/ProductImageZoomModal.tsx`
- Test: `apps/web/src/widgets/product-gallery/ui/ProductImageZoomModal.test.tsx`

**Interfaces:**
- Consumes: `useMediaQuery` from `@shared/lib/hooks`; `Dialog/DialogContent/DialogTitle/DialogDescription`, `Drawer/DrawerContent/DrawerClose/DrawerTitle/DrawerDescription` from `@seoul-moment/ui`.
- Produces: default export React 컴포넌트

  ```ts
  interface ProductImageZoomModalProps {
    images: string[];
    productName: string;
    open: boolean;
    startIndex: number;
    onOpenChange(open: boolean): void;
  }
  ```

  Task 2(`ProductGallery`)가 이 컴포넌트를 `./ProductImageZoomModal`에서 default import 해 위 props로 사용한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`apps/web/src/widgets/product-gallery/ui/ProductImageZoomModal.test.tsx`:

```tsx
import type { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/i18n/messages/ko.json";

import { render, screen } from "@testing-library/react";

import ProductImageZoomModal from "./ProductImageZoomModal";

const useMediaQueryMock = vi.fn();

vi.mock("@shared/lib/hooks", () => ({
  useMediaQuery: () => useMediaQueryMock(),
}));

// Swiper는 jsdom에서 동작하지 않으므로 children을 그대로 렌더하는 더미로 대체
vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: ReactNode }) => (
    <div data-testid="slide">{children}</div>
  ),
}));

vi.mock("swiper/modules", () => ({
  Zoom: {},
  Navigation: {},
  Pagination: {},
}));

// next/image → 순수 img
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as object)} />;
  },
}));

const IMAGES = ["/a.jpg", "/b.jpg", "/c.jpg"];

const renderModal = (ui: ReactNode) =>
  render(
    <NextIntlClientProvider locale="ko" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );

describe("ProductImageZoomModal", () => {
  beforeEach(() => {
    useMediaQueryMock.mockReset();
  });

  it("데스크톱에서 dialog role과 이미지 개수만큼 슬라이드를 렌더한다", () => {
    // given
    useMediaQueryMock.mockReturnValue(false);

    // when
    renderModal(
      <ProductImageZoomModal
        images={IMAGES}
        onOpenChange={() => {}}
        open={true}
        productName="Test"
        startIndex={0}
      />,
    );

    // then
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByTestId("slide")).toHaveLength(IMAGES.length);
  });

  it("모바일에서 닫기 버튼(aria-label=닫기)을 렌더한다", () => {
    // given
    useMediaQueryMock.mockReturnValue(true);

    // when
    renderModal(
      <ProductImageZoomModal
        images={IMAGES}
        onOpenChange={() => {}}
        open={true}
        productName="Test"
        startIndex={1}
      />,
    );

    // then
    expect(
      screen.getByRole("button", { name: "닫기" }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("slide")).toHaveLength(IMAGES.length);
  });

  it("닫혀 있으면 아무것도 렌더하지 않는다", () => {
    // given
    useMediaQueryMock.mockReturnValue(false);

    // when
    renderModal(
      <ProductImageZoomModal
        images={IMAGES}
        onOpenChange={() => {}}
        open={false}
        productName="Test"
        startIndex={0}
      />,
    );

    // then
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryAllByTestId("slide")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm vitest run src/widgets/product-gallery/ui/ProductImageZoomModal.test.tsx`
Expected: FAIL — `Failed to resolve import "./ProductImageZoomModal"` (파일 없음)

- [ ] **Step 3: 컴포넌트 구현**

`apps/web/src/widgets/product-gallery/ui/ProductImageZoomModal.tsx`:

```tsx
"use client";

import Image from "next/image";
import { Navigation, Pagination, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { XIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { useMediaQuery } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@seoul-moment/ui";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/zoom";

interface ProductImageZoomModalProps {
  images: string[];
  productName: string;
  open: boolean;
  startIndex: number;
  onOpenChange(open: boolean): void;
}

export default function ProductImageZoomModal({
  images,
  productName,
  open,
  startIndex,
  onOpenChange,
}: ProductImageZoomModalProps) {
  const t = useTranslations();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const viewer = (
    <Swiper
      className="h-full w-full"
      initialSlide={startIndex}
      modules={[Zoom, Navigation, Pagination]}
      navigation={!isMobile}
      pagination={isMobile ? { type: "fraction" } : false}
      spaceBetween={10}
      style={{
        "--swiper-navigation-color": "var(--color-brand-foreground)",
        "--swiper-pagination-color": "var(--color-brand-foreground)",
        "--swiper-navigation-size": "30px",
      }}
      zoom={{ maxRatio: 3 }}
    >
      {images.map((src, idx) => (
        <SwiperSlide
          className="flex items-center justify-center"
          key={`zoom-${src}-${idx + 1}`}
        >
          <div className="swiper-zoom-container h-full w-full">
            <Image
              alt={`${productName} - ${idx + 1}`}
              className="h-full w-full object-contain"
              height={1200}
              sizes="(max-width: 640px) 100vw, 900px"
              src={src}
              width={1200}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent
          className={cn(
            "data-[vaul-drawer-direction=bottom]:h-[100dvh]",
            "data-[vaul-drawer-direction=bottom]:max-h-[100dvh]",
            "data-[vaul-drawer-direction=bottom]:rounded-none",
          )}
        >
          <DrawerTitle className="sr-only">{productName}</DrawerTitle>
          <DrawerDescription className="sr-only" />
          <DrawerClose
            aria-label={t("close")}
            className="absolute right-4 top-4 z-10 opacity-70 transition-opacity hover:opacity-100"
          >
            <XIcon className="size-6" />
          </DrawerClose>
          <div className="flex min-h-0 w-full flex-1 items-center overflow-hidden">
            {viewer}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="h-[90vh] max-h-[900px] w-[900px] max-w-[90vw] overflow-hidden p-0">
        <DialogTitle className="sr-only">{productName}</DialogTitle>
        <DialogDescription className="sr-only" />
        <div className="flex h-full w-full items-center overflow-hidden px-12">
          {viewer}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm vitest run src/widgets/product-gallery/ui/ProductImageZoomModal.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: 린트 정리**

Run: `pnpm lint:fix:web`
Expected: 에러 없음. 이후 `ProductImageZoomModal.tsx` 재확인(import 재정렬 가능).

- [ ] **Step 6: 커밋**

```bash
git add apps/web/src/widgets/product-gallery/ui/ProductImageZoomModal.tsx apps/web/src/widgets/product-gallery/ui/ProductImageZoomModal.test.tsx
git commit -m "feat(web): add product image zoom modal (responsive dialog/drawer)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `ProductGallery`에 모달 트리거 연결

메인 이미지 클릭 시 해당 인덱스로 모달을 연다. 썸네일 클릭은 기존대로 메인 전환 용도만 유지.

**Files:**
- Modify: `apps/web/src/widgets/product-gallery/ui/ProductGallery.tsx`
- Test: `apps/web/src/widgets/product-gallery/ui/ProductGallery.test.tsx` (Create)

**Interfaces:**
- Consumes: Task 1의 `ProductImageZoomModal` (default import, props `{ images, productName, open, startIndex, onOpenChange }`).
- Produces: 외부 노출 인터페이스 변경 없음 (`ProductGalleryProps`는 `{ images, productName }` 유지).

- [ ] **Step 1: 실패하는 테스트 작성**

`apps/web/src/widgets/product-gallery/ui/ProductGallery.test.tsx`:

```tsx
import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import ProductGallery from "./ProductGallery";

// Swiper 더미: children 그대로 렌더
vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("swiper/modules", () => ({
  FreeMode: {},
  Navigation: {},
  Thumbs: {},
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as object)} />;
  },
}));

// 모달은 open/startIndex만 노출하는 더미로 대체
vi.mock("./ProductImageZoomModal", () => ({
  default: ({ open, startIndex }: { open: boolean; startIndex: number }) =>
    open ? (
      <div data-start={startIndex} data-testid="zoom-modal" />
    ) : null,
}));

const IMAGES = ["/a.jpg", "/b.jpg", "/c.jpg"];

describe("ProductGallery", () => {
  it("초기에는 확대 모달이 닫혀 있다", () => {
    // when
    render(<ProductGallery images={IMAGES} productName="Test" />);

    // then
    expect(screen.queryByTestId("zoom-modal")).not.toBeInTheDocument();
  });

  it("메인 이미지 클릭 시 해당 인덱스로 모달을 연다", () => {
    // given
    render(<ProductGallery images={IMAGES} productName="Test" />);

    // when: 두 번째 메인 이미지 클릭
    fireEvent.click(screen.getByAltText("Test - 2"));

    // then
    const modal = screen.getByTestId("zoom-modal");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute("data-start", "1");
  });

  it("썸네일 클릭은 모달을 열지 않는다", () => {
    // given
    render(<ProductGallery images={IMAGES} productName="Test" />);

    // when
    fireEvent.click(screen.getByAltText("Test - thumbnail 1"));

    // then
    expect(screen.queryByTestId("zoom-modal")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm vitest run src/widgets/product-gallery/ui/ProductGallery.test.tsx`
Expected: FAIL — "메인 이미지 클릭 시..." 테스트에서 `zoom-modal`을 찾지 못함(클릭 핸들러/모달 미연결). (썸네일 alt에는 "thumbnail"이 포함되어 `getByAltText("Test - 2")`는 메인 이미지에만 매칭됨.)

- [ ] **Step 3: `ProductGallery` 수정**

`ProductGallery.tsx`를 아래로 변경한다. 변경점: (1) `useState`로 `modalOpen`/`startIndex` 추가, (2) 메인 이미지에 `onClick`·`cursor-zoom-in` 추가, (3) `ProductImageZoomModal` 렌더.

전체 파일:

```tsx
"use client";

import { useState } from "react";

import Image from "next/image";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import type { SwiperClass } from "swiper/react";
import { Swiper, SwiperSlide } from "swiper/react";

import { cn } from "@shared/lib/style";

import ProductImageZoomModal from "./ProductImageZoomModal";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const handleOpenModal = (index: number) => {
    setStartIndex(index);
    setModalOpen(true);
  };

  return (
    <div
      className={cn(
        "w-[560px] gap-[17px] px-[20px]",
        "max-sm:w-full max-sm:px-0",
      )}
    >
      <Swiper
        className={cn(
          "mb-[17px] h-[560px] w-[560px]",
          "max-sm:aspect-square max-sm:h-auto max-sm:w-full",
        )}
        modules={[FreeMode, Navigation, Thumbs]}
        navigation={true}
        spaceBetween={10}
        style={{
          "--swiper-navigation-color": "var(--color-brand-foreground)",
          "--swiper-pagination-color": "var(--color-brand-foreground)",
          "--swiper-navigation-sides-offset": "40px",
          "--swiper-navigation-size": "30px",
        }}
        thumbs={{ swiper: thumbsSwiper }}
      >
        {images.map((src, idx) => (
          <SwiperSlide key={`${src}-${idx + 1}`}>
            <Image
              alt={`${productName} - ${idx + 1}`}
              className="h-full cursor-zoom-in"
              height={800}
              onClick={() => handleOpenModal(idx)}
              priority={idx === 0}
              sizes="(max-width: 640px) 100vw, 560px"
              src={src}
              width={800}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="px-[20px]">
        <Swiper
          className="mySwiper"
          freeMode={true}
          modules={[FreeMode, Navigation, Thumbs]}
          onSwiper={setThumbsSwiper}
          slidesPerView={8}
          spaceBetween={8}
          watchSlidesProgress={true}
        >
          {images.map((src, idx) => (
            <SwiperSlide key={`sub-${src}-${idx + 1}`}>
              <Image
                alt={`${productName} - thumbnail ${idx + 1}`}
                className="object-contain"
                height={800}
                sizes="80px"
                src={src}
                width={800}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <ProductImageZoomModal
        images={images}
        onOpenChange={setModalOpen}
        open={modalOpen}
        productName={productName}
        startIndex={startIndex}
      />
    </div>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm vitest run src/widgets/product-gallery/ui/ProductGallery.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: 린트 정리**

Run: `pnpm lint:fix:web`
Expected: 에러 없음. 이후 `ProductGallery.tsx` 재확인.

- [ ] **Step 6: 커밋**

```bash
git add apps/web/src/widgets/product-gallery/ui/ProductGallery.tsx apps/web/src/widgets/product-gallery/ui/ProductGallery.test.tsx
git commit -m "feat(web): open zoom modal on product main image click

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 실제 앱에서 동작 검증

단위 테스트는 Swiper를 더미로 대체하므로 줌·슬라이드·반응형 실제 동작은 브라우저에서 확인한다.

**Files:** (변경 없음 — 수동/도구 검증)

- [ ] **Step 1: 개발 서버 실행 및 상품 상세 접근**

Run: `pnpm dev:web` 후 상품 상세 페이지(`/{locale}/product/{id}`)로 이동.

- [ ] **Step 2: 데스크톱 검증 (뷰포트 ≥ 641px)**

확인 항목:
- 메인 이미지에 마우스를 올리면 `cursor-zoom-in`(확대 커서) 표시
- 메인 이미지 클릭 → 화면 중앙 900px Dialog 오픈
- 좌우 화살표로 다음/이전 이미지 이동
- 더블클릭/휠로 이미지 내부 확대(최대 3배), 오버레이 클릭 또는 우상단 X로 닫힘

- [ ] **Step 3: 모바일 검증 (뷰포트 ≤ 640px)**

DevTools 디바이스 모드(또는 실제 모바일)에서 확인:
- 메인 이미지 탭 → 하단에서 올라오는 full-height Drawer 오픈
- 좌우 스와이프로 이미지 이동, 하단 fraction 인디케이터(예: 1/3) 표시
- 핀치/더블탭으로 확대, 상단 X 또는 아래로 드래그하여 닫힘

- [ ] **Step 4: 빌드/타입 확인**

Run: `pnpm build:web`
Expected: 타입 에러·빌드 실패 없음.

- [ ] **Step 5: (선택) verify 스킬로 마무리 검증**

`/verify` 스킬 또는 chrome-devtools-mcp로 위 3축(데스크톱/모바일/줌) 스크린샷 캡처로 근거 남기기.

---

## Self-Review

**1. Spec coverage**
- 데스크톱 중앙 Dialog(900px) + 슬라이드 → Task 1 Dialog 분기, Task 3 Step 2. ✅
- 모바일 하단 full Drawer + 슬라이드 → Task 1 Drawer 분기(`h-[100dvh]`), Task 3 Step 3. ✅
- 핀치/더블탭/휠 줌 → Task 1 `Zoom` 모듈 `maxRatio: 3`, Task 3. ✅
- 트리거 = 메인 이미지 클릭만 → Task 2 (썸네일 미연결 테스트 포함). ✅
- 이미지 소스 = 기존 `images` 재사용, 추가 fetch 없음 → Task 2. ✅
- 접근성(sr-only Title/Description, alt 유지), i18n(`close` 재사용) → Task 1. ✅

**2. Placeholder scan**: TBD/TODO/모호 지시 없음. 모든 코드 단계에 전체 코드 포함. ✅

**3. Type consistency**: `ProductImageZoomModalProps`(images, productName, open, startIndex, onOpenChange)가 Task 1 정의와 Task 2 사용처에서 일치. `handleOpenModal(index)` → `setStartIndex`/`setModalOpen` 일관. ✅
