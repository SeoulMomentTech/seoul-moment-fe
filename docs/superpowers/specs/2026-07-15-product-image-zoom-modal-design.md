# 상품 상세 이미지 확대 모달 설계

날짜: 2026-07-15
대상 앱: `apps/web`

## 목표

상품 상세 페이지에서 메인 상품 이미지를 클릭하면 확대 모달이 열려 이미지를
크게 볼 수 있게 한다.

- **데스크톱**: 화면 중앙 Dialog(폭 900px)로 노출, 좌우 슬라이드로 이미지 이동.
- **모바일 웹**: 하단에서 올라오는 full-height Drawer로 노출, 슬라이드로 다음
  이미지 이동.
- **줌**: 핀치(모바일) / 더블탭 / 더블클릭·휠(데스크톱)로 이미지 내부 확대.

## 범위

- 트리거: **메인 이미지 클릭만**. 썸네일 클릭은 기존처럼 메인 이미지 전환 용도로
  유지하며 모달을 열지 않는다.
- 이미지 소스: 기존 `ProductGallery`가 이미 받는 `images`(=`data.subImage`)를
  그대로 사용. 추가 fetch 없음.

## 접근 방식

반응형 단일 컴포넌트 `ProductImageZoomModal`을 신규 작성한다.
`useMediaQuery("(max-width: 640px)")`(프로젝트 `max-sm` 브레이크포인트와 일치)로
데스크톱은 `Dialog`, 모바일은 `Drawer(direction="bottom")`로 분기하고, 내부 Swiper
줌 콘텐츠는 공유한다.

외부 라이트박스 라이브러리는 도입하지 않는다. 프로젝트가 이미 Swiper 11을
사용하므로 `Zoom` 모듈로 줌을 구현한다.

## 컴포넌트 구조

```
widgets/product-gallery/ui/
 ├─ ProductGallery.tsx          (기존, 수정)
 │   ├─ state: modalOpen, startIndex
 │   ├─ 메인 Swiper onSlideChange → activeIndex 추적
 │   ├─ 메인 이미지 클릭 → setStartIndex(activeIndex) + setModalOpen(true)
 │   └─ 메인 이미지에 cursor-zoom-in
 └─ ProductImageZoomModal.tsx   (신규)
     ├─ props: { images, productName, open, onOpenChange, startIndex }
     ├─ 데스크톱: Dialog (중앙, w-[900px], 닫기 X, 좌우 화살표)
     ├─ 모바일:   Drawer direction="bottom" (h-[100dvh] full, 상단 닫기 X, 페이지 인디케이터)
     └─ 공통 내부 Swiper:
         - modules: [Zoom, Navigation, Pagination]
         - initialSlide = startIndex
         - zoom={{ maxRatio: 3 }}
         - 각 slide: <div className="swiper-zoom-container"> <Image /> </div>
```

## 데이터 흐름

- 모달은 별도 데이터 요청 없이 `ProductGallery`가 보유한 `images` 배열을
  props로 전달받는다.
- `ProductGallery`가 모달 열림 상태(`modalOpen`)와 시작 인덱스(`startIndex`)를
  소유한다.
- 모달이 열릴 때 `startIndex`를 메인 Swiper의 현재 활성 인덱스로 설정한다.

## 인터랙션 세부

- **줌**: `swiper/css/zoom` import, Swiper `Zoom` 모듈. 데스크톱 더블클릭/휠,
  모바일 핀치/더블탭. `maxRatio: 3`.
- **슬라이드**: `Navigation`(좌우 화살표) + `Pagination`(모바일 페이지 인디케이터).
  줌 상태에서는 Swiper가 슬라이드보다 팬(pan)을 우선한다(Swiper 기본 동작).
- **닫기**: 모바일은 Drawer 기본 드래그다운 + 상단 X 버튼, 데스크톱은 Dialog X
  버튼 + 바깥 클릭.

## 접근성 / i18n

- `DialogTitle`은 sr-only로 상품명 기반 제목 제공, `DialogDescription` sr-only.
- 이미지 `alt`는 기존 갤러리 패턴(`${productName} - ${idx + 1}`) 유지.
- 닫기 라벨 등은 기존 `close` 번역 키 재사용. 신규 문구가 필요하면 messages에
  키 추가 후 i18n 동기화.

## 테스트

- 단위: `ProductImageZoomModal` 렌더 — 데스크톱/모바일 분기(useMediaQuery 모킹),
  `startIndex`가 initialSlide에 반영되는지, 이미지 개수만큼 슬라이드 렌더.
- E2E(선택): 메인 이미지 클릭 → 모달 오픈 → 슬라이드 이동 → 닫기.

## 영향 범위

- 수정: `apps/web/src/widgets/product-gallery/ui/ProductGallery.tsx`
- 신규: `apps/web/src/widgets/product-gallery/ui/ProductImageZoomModal.tsx`
- 잠재: `messages/*.json`(신규 라벨 필요 시)
