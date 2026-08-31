import { cn } from "@shared/lib/style";

import { Skeleton } from "@seoul-moment/ui";

/**
 * PromotionPage 의 실제 렌더 구조를 그대로 따라가는 스켈레톤.
 *
 * 두 가지를 지킨다.
 * - 섹션 순서/배경/패딩은 실제 컴포넌트와 동일하게 둔다. 로딩 → 데이터 전환에서
 *   페이지 리듬이 바뀌지 않아야 한다.
 * - 텍스트 자리 스켈레톤 높이는 글자 높이가 아니라 line box 높이(font-size * 1.5,
 *   `leading-none` 인 곳은 font-size)로 맞춘다. 그래야 전체 높이가 실제와 어긋나지 않는다.
 *
 * VStack/HStack 은 정렬을 inline style 로 걸기 때문에 `max-sm:items-*` 클래스가
 * 먹지 않는다. 즉 실제 화면은 모바일에서도 가운데 정렬이므로 여기서도 items-center 를 쓴다.
 *
 * 렌더 개수(브랜드 탭·상품·팝업 탭·쿠폰·공지)는 API 응답에 따라 달라지므로
 * 대표적인 개수로 고정한다.
 */
export default function PromotionDetailLoading() {
  return (
    <>
      {/* MainBanner */}
      <section
        className={cn(
          "min-w-7xl h-[556px] pt-14",
          "max-sm:h-[656px] max-sm:min-w-full",
        )}
      >
        <Skeleton className="h-full w-full" />
      </section>

      {/* BrandTab */}
      <nav className="border-b border-black/10 bg-white">
        <div
          className={cn(
            "w-7xl mx-auto flex justify-center gap-[50px]",
            "scrollbar-hide max-sm:w-full max-sm:justify-start max-sm:gap-5 max-sm:overflow-x-auto max-sm:px-5",
          )}
        >
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              className="flex shrink-0 flex-col items-center gap-4 border-b-2 border-transparent py-5"
              key={`brand-tab-${idx + 1}`}
            >
              <Skeleton className="size-[50px] rounded-full max-sm:size-10" />
              {/* text-body-3 + leading-none */}
              <Skeleton className="h-[14px] w-[60px]" />
            </div>
          ))}
        </div>
      </nav>

      {/* BrandIntroduction */}
      <section className={cn("w-7xl mx-auto bg-white py-10", "max-sm:w-full")}>
        <div className="mx-auto max-w-[846px] px-4 max-sm:px-5">
          <div className="flex flex-col items-center gap-[30px]">
            {/* 좋아요 / 공유 (모바일은 좌측에 브랜드명) */}
            <div className="flex w-full items-center justify-end max-sm:justify-between">
              <Skeleton className="hidden h-[18px] w-[90px] max-sm:block" />
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-6" />
                <Skeleton className="size-6" />
              </div>
            </div>

            {/* 브랜드명 + 로고 */}
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-[21px] w-[100px] max-sm:hidden" />
              <Skeleton className="h-20 w-[153px]" />
            </div>

            {/* 소개 + 안내 문구 */}
            <div className="flex w-full flex-col items-center gap-5">
              <div className="flex w-full flex-col items-center gap-1">
                <Skeleton className="h-[21px] w-full" />
                <Skeleton className="h-[21px] w-full" />
                <Skeleton className="h-[21px] w-[70%]" />
              </div>
              <Skeleton className="h-[18px] w-full" />
            </div>

            {/* 브랜드 / 쇼핑 버튼 */}
            <div className="flex gap-2.5 max-sm:w-full">
              <Skeleton className="h-12 w-[124px] rounded-sm max-sm:h-[38px] max-sm:w-[155px] max-sm:flex-1" />
              <Skeleton className="h-12 w-[124px] rounded-sm max-sm:h-[38px] max-sm:w-[155px] max-sm:flex-1" />
            </div>
          </div>
        </div>
      </section>

      {/* BrandLookbook - 섹션 타입은 응답에 따라 달라지므로 단일/2단 조합으로 대표한다 */}
      <section
        className={cn(
          "min-w-7xl mx-auto overflow-hidden bg-neutral-50 py-[100px]",
          "max-sm:min-w-auto max-sm:py-[60px]",
        )}
      >
        <div className="flex flex-col items-center gap-[100px] max-sm:gap-[60px]">
          {/* TYPE_1 */}
          <Skeleton className="h-[944px] w-[630px] max-sm:h-[540px] max-sm:w-full" />
          {/* TYPE_2 */}
          <div className="max-w-[1064px] px-4 max-sm:w-full max-sm:px-0">
            <div className="flex items-center gap-[30px] max-sm:gap-0">
              {Array.from({ length: 2 }).map((_, idx) => (
                <Skeleton
                  className="h-[644px] w-[517px] flex-1 max-sm:h-[218px]"
                  key={`lookbook-pair-${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BrandSpecialEvent */}
      <section className="w-full border-b border-black/10 bg-white py-[100px] max-sm:py-[60px]">
        <div className="max-sm:min-w-auto min-w-7xl mx-auto max-w-[1920px] px-4 max-sm:px-5">
          <div className="flex flex-col items-center gap-[50px]">
            {/* text-title-2 / max-sm:text-title-3 */}
            <Skeleton className="h-12 w-[220px] max-sm:h-9 max-sm:w-[180px]" />
            <div
              className={cn(
                "grid w-full max-w-7xl grid-cols-4 gap-x-5 gap-y-10",
                "max-sm:grid-cols-2 max-sm:gap-y-5",
              )}
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <SpecialProductCardSkeleton
                  key={`special-product-${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BrandOfflinePopup */}
      <section
        className={cn(
          "min-w-7xl w-full border-b border-black/10 bg-white py-[100px]",
          "max-sm:min-w-auto max-sm:py-[60px]",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 max-sm:px-0">
          <div className="flex flex-col items-center gap-[60px] max-sm:gap-[30px]">
            {/* text-title-2 / max-sm:text-title-4 */}
            <Skeleton className="h-12 w-[260px] max-sm:h-[30px] max-sm:w-[200px]" />

            {/* 날짜 탭 */}
            <div className="scrollbar-hide w-full max-sm:overflow-x-auto max-sm:px-5">
              <div className="flex justify-center gap-2.5 max-sm:w-max">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Skeleton
                    className="h-10 w-[90px] shrink-0 rounded-full"
                    key={`popup-tab-${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 슬라이더 + 정보 */}
            <div className="flex w-full flex-row gap-10 max-sm:flex-col max-sm:gap-[30px]">
              <Skeleton className="h-[400px] w-[630px] shrink-0 max-sm:h-[230px] max-sm:w-full" />
              <div className="flex flex-1 flex-col justify-center gap-10 max-sm:gap-5 max-sm:px-5">
                {/* text-title-3 / max-sm:text-body-1 */}
                <Skeleton className="h-9 w-[240px] max-sm:h-[27px]" />
                <div className="flex w-full flex-col gap-[30px] max-sm:gap-2">
                  {["location", "date", "time", "address"].map((row) => (
                    <div className="flex w-full gap-4" key={`popup-row-${row}`}>
                      <Skeleton className="h-[21px] w-[60px] shrink-0" />
                      <Skeleton className="h-[21px] w-[180px]" />
                    </div>
                  ))}
                  <div className="flex w-full flex-col gap-4">
                    <Skeleton className="h-[21px] w-[80px]" />
                    <div className="flex w-full flex-col gap-1">
                      <Skeleton className="h-[21px] w-full" />
                      <Skeleton className="h-[21px] w-[85%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 지도 */}
            <Skeleton className="h-[300px] w-full max-sm:h-[130px]" />
          </div>
        </div>
      </section>

      {/* BrandOnlineEvent */}
      <section className="w-full bg-white">
        {/* 쿠폰 이벤트 */}
        <div
          className={cn(
            "min-w-7xl mx-auto flex w-full flex-col items-center gap-10 pb-[50px] pt-[140px]",
            "max-sm:min-w-full max-sm:pb-5 max-sm:pt-[50px]",
          )}
        >
          <Skeleton className="h-12 w-[300px] max-sm:h-[30px] max-sm:w-[220px]" />
          <div className="scrollbar-hide w-full overflow-x-auto max-sm:px-5">
            <div className="mx-auto flex w-fit justify-center gap-2.5 max-sm:w-max">
              {Array.from({ length: 2 }).map((_, idx) => (
                <EventCardSkeleton key={`event-coupon-${idx + 1}`} />
              ))}
            </div>
          </div>
        </div>

        {/* 공지 */}
        <div
          className={cn(
            "w-full bg-neutral-50 py-10",
            "max-lg:w-7xl",
            "max-sm:w-full max-sm:px-5 max-sm:py-[30px]",
          )}
        >
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
            <Skeleton className="h-[21px] w-[120px]" />
            <div className="flex flex-col gap-3 pl-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton
                  className="h-[21px] w-full last:w-[60%]"
                  key={`notice-${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 브랜드 링크 (실제로는 브랜드 컬러 배경) */}
        <div className="flex w-full flex-col items-center gap-[50px] bg-neutral-100 py-[74px] max-sm:px-5 max-sm:py-20">
          <Skeleton className="h-[100px] w-[413px] max-sm:h-[68px] max-sm:w-[288px]" />
          <div className="flex w-full max-w-[413px] justify-center gap-2.5 max-sm:max-w-full">
            <Skeleton className="h-[52px] w-[124px] rounded-sm max-sm:w-[155px]" />
            <Skeleton className="h-[52px] w-[124px] rounded-sm max-sm:w-[155px]" />
          </div>
        </div>
      </section>
    </>
  );
}

function SpecialProductCardSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Skeleton className="aspect-305/407 w-[305px] max-sm:w-full" />
      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            {/* brandName: text-body-5 */}
            <Skeleton className="h-[18px] w-[80px]" />
            {/* productName: text-body-3 + leading-tight */}
            <Skeleton className="h-[18px] w-[180px] max-sm:w-full" />
          </div>
          {/* price: text-body-2 / max-sm:text-body-3 */}
          <Skeleton className="h-6 w-[100px] max-sm:h-[21px]" />
        </div>
        <div className="flex gap-2.5">
          <Skeleton className="h-[19px] w-[44px]" />
          <Skeleton className="h-[19px] w-[64px]" />
        </div>
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div
      className={cn(
        "flex h-[586px] w-[620px] shrink-0 flex-col items-center gap-[30px]",
        "border border-solid border-black/10 bg-white px-4 py-[30px]",
        "max-sm:h-auto max-sm:w-[320px]",
      )}
    >
      <div className="flex w-full justify-center border-b border-solid border-black/10 pb-5">
        {/* text-body-1 + leading-none */}
        <Skeleton className="h-[18px] w-[200px]" />
      </div>
      <div className="flex w-full flex-col items-center gap-[30px]">
        {/* text-body-3 + leading-none */}
        <Skeleton className="h-[14px] w-[260px] max-sm:w-full" />
        <Skeleton className="h-[386px] w-full border border-solid border-black/10 max-sm:h-[200px]" />
      </div>
    </div>
  );
}
