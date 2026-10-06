import { useRef, useState } from "react";

import { FlatList, useWindowDimensions, View } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import { PAGER_HEIGHT, SlidePager } from ".";

// 슬라이드와 페이저 사이 간격. 웹 모바일 구간(mt-10)과 같다.
const PAGER_MARGIN_TOP = 40;

interface SlideCarouselProps<T> {
  data: T[];
  keyExtractor(item: T): string;
  /** 폭은 화면 전체다. 좌우 여백이 필요하면 카드가 직접 준다. */
  renderItem(item: T): React.ReactElement;
}

/**
 * 한 장씩 넘기는 가로 슬라이드 + 아래 페이저. 웹 홈의 NewsMobileSlider / ArticleSlide 와 같다.
 * RN 에는 Swiper 가 없어 pagingEnabled FlatList 를 쓴다 — 페이지 폭이 화면 폭이라
 * 스크롤이 끝난 지점의 오프셋을 폭으로 나누면 현재 장이 된다.
 */
export function SlideCarousel<T>({
  data,
  keyExtractor,
  renderItem,
}: SlideCarouselProps<T>) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<T>>(null);
  const [index, setIndex] = useState(0);

  const goTo = (next: number) => {
    // 화살표 연타로 범위를 벗어나면 scrollToIndex 가 던진다.
    const clamped = Math.max(0, Math.min(next, data.length - 1));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
  };

  const handleEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View>
      <FlatList
        data={data}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        horizontal
        keyExtractor={keyExtractor}
        onMomentumScrollEnd={handleEnd}
        pagingEnabled
        ref={listRef}
        renderItem={({ item }) => (
          <View style={{ width }}>{renderItem(item)}</View>
        )}
        showsHorizontalScrollIndicator={false}
      />
      {/* 한 장뿐이면 넘길 곳이 없어 페이저를 그리지 않는다. */}
      {data.length > 1 ? (
        <View style={{ marginTop: PAGER_MARGIN_TOP }}>
          <SlidePager
            index={index}
            onNext={() => goTo(index + 1)}
            onPrev={() => goTo(index - 1)}
            total={data.length}
          />
        </View>
      ) : null}
    </View>
  );
}

/** 슬라이드 높이에 더해지는 페이저 영역. 스켈레톤이 같은 높이를 잡을 때 쓴다. */
export const CAROUSEL_PAGER_BLOCK = PAGER_MARGIN_TOP + PAGER_HEIGHT;
