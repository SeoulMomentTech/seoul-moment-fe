import { Pressable, Text, View } from "react-native";

export const PAGER_BAR_HEIGHT = 1;
export const PAGER_ROW_HEIGHT = 20;
// 진행 바 ~ 숫자 줄 사이 간격. 웹 모바일 구간(mt-3)과 같다.
export const PAGER_GAP = 12;
/** 진행 바 + 간격 + 숫자 줄. 스켈레톤이 같은 자리를 잡을 때 쓴다. */
export const PAGER_HEIGHT = PAGER_BAR_HEIGHT + PAGER_GAP + PAGER_ROW_HEIGHT;

const ARROW_HIT_SLOP = 14;

interface SlidePagerProps {
  /** 0-based. 표시는 1-based 로 한다. */
  index: number;
  total: number;
  onPrev(): void;
  onNext(): void;
}

/**
 * 한 장씩 넘기는 슬라이드 아래에 붙는 진행 바 + "현재 / 전체" + 좌우 화살표.
 * 웹 홈의 NewsMobileSlider / ArticleSlide 와 같은 구성이다.
 * 장이 하나뿐이면 넘길 곳이 없으므로 호출부가 그릴지 말지 정한다.
 */
export function SlidePager({ index, total, onPrev, onNext }: SlidePagerProps) {
  const current = index + 1;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <View className="px-5">
      <View
        className="bg-neutral-subtle relative w-full"
        style={{ height: PAGER_BAR_HEIGHT }}
      >
        <View
          className="bg-foreground absolute left-0 top-0 h-full"
          style={{ width: `${total > 0 ? (current / total) * 100 : 0}%` }}
        />
      </View>
      <View
        className="flex-row items-center justify-center"
        style={{ marginTop: PAGER_GAP, gap: 16, height: PAGER_ROW_HEIGHT }}
      >
        <Arrow
          disabled={isFirst}
          label="Previous"
          onPress={onPrev}
          symbol="‹"
        />
        <Text className="text-body-3 text-neutral">{`${current} / ${total}`}</Text>
        <Arrow disabled={isLast} label="Next" onPress={onNext} symbol="›" />
      </View>
    </View>
  );
}

function Arrow({
  symbol,
  label,
  disabled,
  onPress,
}: {
  symbol: string;
  label: string;
  disabled: boolean;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      // 글리프 한 자뿐이라 터치 영역을 넓혀 44pt 를 넘긴다.
      hitSlop={ARROW_HIT_SLOP}
      onPress={onPress}
    >
      <Text
        className={
          disabled ? "text-body-2 text-neutral" : "text-body-2 text-foreground"
        }
        style={disabled ? { opacity: 0.3 } : undefined}
      >
        {symbol}
      </Text>
    </Pressable>
  );
}
