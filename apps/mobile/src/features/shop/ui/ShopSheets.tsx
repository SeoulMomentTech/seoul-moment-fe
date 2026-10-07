import { Fragment, useEffect, useState, type ReactNode } from "react";

import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@shared/ui/accordion";
import { Touchable } from "@shared/ui/press";
import { SectionError } from "@shared/ui/section-state";
import { ChipRowsSkeleton, Shimmer } from "@shared/ui/skeleton";

import { useBrandFilter } from "../model/useBrandFilter";
import { useProductCategories } from "../model/useProductCategories";
import { useProductCount } from "../model/useProductCount";
import { useProductOptionFilters } from "../model/useProductOptionFilters";
import { useProductSortOptions } from "../model/useProductSortOptions";
import { useShopFilterStore } from "../model/useShopFilterStore";
import type {
  CompleteShopFilter,
  ShopFilter,
} from "../model/useShopFilterStore";

const SHEET_MAX_HEIGHT = "85%";
const SHEET_ANIMATION_MS = 250;
const SWATCH_SIZE = 14;

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose(): void;
  children: ReactNode;
}

/**
 * 바텀 시트 라이브러리가 없어서 Modal 로 만든다.
 * animationType="slide" 는 딤 배경까지 같이 밀어 올려서, Modal 은 애니메이션 없이 두고
 * 배경(opacity)과 패널(translateY)을 Animated 로 따로 움직인다.
 *
 * - visible: 호출자가 원하는 열림 상태.
 * - shown: Modal 이 실제로 화면에 올라온 뒤(onShow)부터 닫힘 애니메이션이 끝날 때까지 true.
 *   Modal 의 visible 은 `visible || shown` 이라, 닫힘 애니메이션이 끝나기 전에는 내려가지 않는다.
 * - children 은 Modal 이 보이는 동안만 마운트된다. 닫히는 도중 다시 열리면 Modal 이 그대로
 *   떠 있어서 children 이 유지되므로, session 키를 바꿔 draft 를 새로 시드한다.
 */
function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [shown, setShown] = useState(false);
  const [session, setSession] = useState(0);
  const [prevVisible, setPrevVisible] = useState(visible);
  // 0: 닫힘(배경 투명, 패널은 화면 아래) / 1: 열림(배경 불투명, 패널 제자리)
  const [progress] = useState(() => new Animated.Value(0));

  // 열릴 때마다 키를 올린다(effect 에서 setState 하지 않기 위해 렌더 중에 처리).
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setSession((s) => s + 1);
  }

  // 열림 애니메이션은 반드시 Modal 이 올라온 뒤(shown)에만 시작한다.
  // visible 이 바뀌는 시점의 effect 는 Modal 의 네이티브 뷰가 생기기 전에 돌아서,
  // 네이티브 드라이버 애니메이션이 아직 없는 뷰에 걸려 progress 가 0 에서 움직이지 않았다
  // (시트는 마운트됐지만 배경 투명 + 패널이 화면 밖인 채로 보이지 않았다).
  // 그래서 onShow 에서 shown 을 켜고, 이 effect 가 그 뒤에 애니메이션을 시작한다.
  // 닫힘이나 닫히는 도중의 재열림도 같은 effect 가 현재 값에서 이어서 처리한다.
  useEffect(() => {
    if (!shown) return;
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: SHEET_ANIMATION_MS,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    // 중간에 stop 되면 finished 가 false 라서, 다시 열린 시트를 내리지 않는다.
    animation.start(({ finished }) => {
      if (finished && !visible) setShown(false);
    });
    return () => animation.stop();
  }, [visible, shown, progress]);

  // 패널 높이는 화면의 85% 이하라서 windowHeight 만큼 내리면 항상 화면 밖이다.
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [windowHeight, 0],
  });

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      onShow={() => setShown(true)}
      transparent
      visible={visible || shown}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          // 딤 처리용 반투명 검정. 위치는 고정하고 opacity 만 바뀐다.
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            opacity: progress,
          }}
        >
          <Touchable
            accessibilityLabel="Close"
            accessibilityRole="button"
            // 보이는 면이 없는 터치 영역이다. 투명도를 주면 뒤 배경 자체가 깜빡인다.
            feedback="none"
            onPress={onClose}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <Animated.View
          className="bg-background"
          style={{
            maxHeight: SHEET_MAX_HEIGHT,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            transform: [{ translateY }],
          }}
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text className="text-title-4 text-foreground font-bold">
              {title}
            </Text>
            <Touchable
              accessibilityLabel="Close"
              accessibilityRole="button"
              // 글리프 한 줄(22pt)이라 8 로는 38pt 에 그친다. 14 로 50pt 를 만든다.
              hitSlop={14}
              onPress={onClose}
            >
              <Text className="text-body-1 text-neutral">✕</Text>
            </Touchable>
          </View>
          <Fragment key={session}>{children}</Fragment>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * 필터 시트 칩. 목록 위 CategoryChip 과 같은 규칙이다 — 선택을 테두리 두께가 아니라
 * 채움으로 나타내 상자 크기가 변하지 않게 한다. flex-wrap 안이라 2pt 만 커져도
 * 줄 끝 칩이 다음 줄로 넘어간다.
 */
function Chip({
  label,
  selected,
  swatch,
  onPress,
}: {
  label: string;
  selected: boolean;
  swatch?: string | null;
  onPress(): void;
}) {
  return (
    <Touchable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={
        selected
          ? "bg-brand border-brand flex-row items-center rounded-full border px-4 py-2"
          : "border-neutral-subtle flex-row items-center rounded-full border px-4 py-2"
      }
      // 칩 높이가 35pt 라 위아래로 5pt 씩 넓혀 44pt 최소 터치 영역을 맞춘다.
      // 칩 사이 간격이 8pt 뿐이라 좌우는 넓히지 않는다.
      hitSlop={{ top: 5, bottom: 5 }}
      onPress={onPress}
    >
      {swatch ? (
        <View
          className="border-neutral-subtle mr-2 border"
          // API 가 내려주는 색상 코드를 그대로 쓴다
          style={{
            width: SWATCH_SIZE,
            height: SWATCH_SIZE,
            borderRadius: SWATCH_SIZE / 2,
            backgroundColor: swatch,
          }}
        />
      ) : null}
      <Text
        className={
          selected
            ? "text-body-3 text-background"
            : "text-body-3 text-foreground"
        }
      >
        {label}
      </Text>
    </Touchable>
  );
}

function FilterSection({
  value,
  title,
  hint,
  disabled = false,
  children,
}: {
  value: string;
  title: string;
  hint?: string;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <AccordionItem isDisabled={disabled} value={value}>
      <AccordionHeader>
        <AccordionTrigger>
          <View className="flex-1">
            <AccordionTitleText>{title}</AccordionTitleText>
            {hint ? (
              <Text className="text-body-3 text-neutral mt-1">{hint}</Text>
            ) : null}
          </View>
          <AccordionIcon />
        </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

function ChipWrap({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap gap-2 px-5">{children}</View>;
}

function EmptyNote({ text }: { text: string }) {
  return (
    <View className="px-5">
      <Text className="text-body-3 text-neutral">{text}</Text>
    </View>
  );
}

/**
 * 상품 카테고리(후드/집업, 니트 …) = productCategoryId. 목록 위 칩 줄이 고르는 최상위
 * 카테고리와는 다른 축이고, 그 선택(categoryId)으로 좁혀진 목록만 보여 준다.
 */
function ProductCategorySection({
  categoryId,
  productCategoryId,
  onSelect,
}: {
  categoryId?: number;
  productCategoryId?: number;
  onSelect(id: number | undefined): void;
}) {
  const { data, isPending, isError, fetchStatus, refetch } =
    useProductCategories(categoryId);

  let body: ReactNode;
  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (isPending) {
    body = <ChipRowsSkeleton />;
  } else if (isError) {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (!data || data.list.length === 0) {
    body = <EmptyNote text="No categories" />;
  } else {
    body = (
      <ChipWrap>
        {data.list.map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            // 이미 고른 카테고리를 다시 누르면 해제한다.
            onPress={() =>
              onSelect(item.id === productCategoryId ? undefined : item.id)
            }
            selected={item.id === productCategoryId}
          />
        ))}
      </ChipWrap>
    );
  }

  return (
    <FilterSection title="Category" value="category">
      {body}
    </FilterSection>
  );
}

function BrandSection({
  brandId,
  onSelect,
}: {
  brandId?: number;
  onSelect(id: number | undefined): void;
}) {
  const { data, isPending, isError, fetchStatus, refetch } = useBrandFilter();

  let body: ReactNode;
  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (isPending) {
    body = <ChipRowsSkeleton />;
  } else if (isError) {
    body = <SectionError onRetry={() => void refetch()} />;
  } else {
    // 알파벳 구간 헤더는 비는 구간이 많아 폰에서는 소음이라, 구간을 펴고 빈 구간은 버린다.
    const brands = (data?.list ?? []).flatMap((group) => group.brandNameList);
    body =
      brands.length === 0 ? (
        <EmptyNote text="No brands" />
      ) : (
        <ChipWrap>
          {brands.map((brand) => (
            <Chip
              key={brand.id}
              label={brand.name}
              onPress={() =>
                onSelect(brand.id === brandId ? undefined : brand.id)
              }
              selected={brand.id === brandId}
            />
          ))}
        </ChipWrap>
      );
  }

  return (
    <FilterSection title="Brand" value="brand">
      {body}
    </FilterSection>
  );
}

function OptionsSection({
  categoryId,
  productCategoryId,
  brandId,
  optionIdList,
  onToggle,
}: {
  categoryId?: number;
  productCategoryId?: number;
  brandId?: number;
  optionIdList: number[];
  onToggle(id: number): void;
}) {
  const { data, isPending, isError, fetchStatus, refetch } =
    useProductOptionFilters({ categoryId, productCategoryId, brandId });

  // product/filter 는 categoryId 가 필수다. 그 값은 시트가 아니라 목록 위 칩 줄에서 정해지므로
  // 안내도 그쪽을 가리킨다. (쿼리가 꺼져 있으면 isPending 이 영원히 유지되므로 아래 가드보다 먼저 거른다.)
  if (categoryId == null) {
    return (
      <FilterSection
        disabled
        hint="Select a category above the list first"
        title="Options"
        value="options"
      />
    );
  }

  let body: ReactNode;
  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (isPending) {
    body = <ChipRowsSkeleton />;
  } else if (isError) {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (!data || data.list.length === 0) {
    // 카테고리·브랜드 중 무엇이 좁혔는지는 모르므로 "이 조합" 이라고만 한다.
    body = <EmptyNote text="No options for this selection" />;
  } else {
    body = (
      <View className="gap-4">
        {data.list.map((group) => (
          <View key={group.title}>
            <Text className="text-body-3 text-neutral mb-2 px-5">
              {group.title}
            </Text>
            <ChipWrap>
              {group.optionValueList.map((option) => (
                <Chip
                  key={option.optionId}
                  label={option.value}
                  onPress={() => onToggle(option.optionId)}
                  selected={optionIdList.includes(option.optionId)}
                  swatch={option.colorCode}
                />
              ))}
            </ChipWrap>
          </View>
        ))}
      </View>
    );
  }

  return (
    <FilterSection title="Options" value="options">
      {body}
    </FilterSection>
  );
}

/**
 * 시트 안쪽. 열릴 때 마운트되므로 draft 는 그때의 store 값으로 시작한다.
 * store 에는 "적용" 을 눌렀을 때만 쓴다.
 */
function FilterSheetContent({ onClose }: { onClose(): void }) {
  const insets = useSafeAreaInsets();
  const setFilter = useShopFilterStore((s) => s.setFilter);

  const [draft, setDraft] = useState<ShopFilter>(() => {
    const s = useShopFilterStore.getState();
    return {
      search: s.search,
      brandId: s.brandId,
      categoryId: s.categoryId,
      productCategoryId: s.productCategoryId,
      optionIdList: s.optionIdList,
      sortColumn: s.sortColumn,
      sort: s.sort,
    };
  });

  // 개수는 적용된 필터가 아니라 draft 를 따라간다.
  const { data: count } = useProductCount(draft);

  // 옵션 목록은 상품 카테고리로도 좁혀진다. 바꾸면 고른 옵션 id 가 새 목록에 없을 수 있어
  // 보이지도 않는 채로 적용되므로 같이 비운다.
  const selectProductCategory = (id: number | undefined) =>
    setDraft((prev) => ({ ...prev, productCategoryId: id, optionIdList: [] }));

  // 브랜드도 옵션 목록을 좁히므로 상품 카테고리와 같은 이유로 고른 옵션을 비운다.
  const selectBrand = (id: number | undefined) =>
    setDraft((prev) => ({ ...prev, brandId: id, optionIdList: [] }));

  const toggleOption = (id: number) =>
    setDraft((prev) => ({
      ...prev,
      optionIdList: prev.optionIdList.includes(id)
        ? prev.optionIdList.filter((v) => v !== id)
        : [...prev.optionIdList, id],
    }));

  // draft 만 비운다. 정렬·검색어·최상위 카테고리는 시트 밖에서 정하는 값이라 남긴다 —
  // 여기서 지우면 시트 뒤에 보이는 칩 줄의 선택이 말없이 풀린다.
  // 비울 키는 생략하지 말고 undefined 로 명시한다. store 의 set 은 얕게 병합하므로
  // 키가 빠지면 이전 값이 그대로 남아 reset 이 store 에 닿지 않는다.
  const resetDraft = () =>
    setDraft((prev) => ({
      search: prev.search,
      brandId: undefined,
      categoryId: prev.categoryId,
      productCategoryId: undefined,
      optionIdList: [],
      sortColumn: prev.sortColumn,
      sort: prev.sort,
    }));

  // setFilter 는 Partial 병합이라 빠진 키가 조용히 무시된다. ShopFilter 의 모든 키를
  // 한 번씩 적어야 컴파일되는 타입으로 받아, 키를 빠뜨리면 타입 에러가 나게 한다.
  const apply = () => {
    const complete: CompleteShopFilter = {
      search: draft.search,
      brandId: draft.brandId,
      categoryId: draft.categoryId,
      productCategoryId: draft.productCategoryId,
      optionIdList: draft.optionIdList,
      sortColumn: draft.sortColumn,
      sort: draft.sort,
    };
    setFilter(complete);
    onClose();
  };

  // 로딩·실패·오프라인이면 data 가 없다. 이전 값이나 0 대신 중립 문구를 쓴다.
  const applyLabel =
    typeof count === "number"
      ? `View ${count.toLocaleString("en-US")} items`
      : "View items";

  return (
    <>
      <ScrollView style={{ flexShrink: 1 }}>
        {/* 세 섹션 모두 처음엔 펼치고, 서로 독립적으로 접는다. */}
        <Accordion
          defaultValue={["category", "brand", "options"]}
          type="multiple"
        >
          <ProductCategorySection
            categoryId={draft.categoryId}
            onSelect={selectProductCategory}
            productCategoryId={draft.productCategoryId}
          />
          <BrandSection brandId={draft.brandId} onSelect={selectBrand} />
          <OptionsSection
            brandId={draft.brandId}
            categoryId={draft.categoryId}
            onToggle={toggleOption}
            optionIdList={draft.optionIdList}
            productCategoryId={draft.productCategoryId}
          />
        </Accordion>
      </ScrollView>
      <View
        className="border-neutral-subtle flex-row gap-3 border-t px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Touchable
          accessibilityLabel="Reset filters"
          accessibilityRole="button"
          className="border-neutral-subtle items-center justify-center rounded-full border px-6 py-3"
          onPress={resetDraft}
        >
          <Text className="text-body-2 text-foreground font-bold">Reset</Text>
        </Touchable>
        <Touchable
          accessibilityLabel={applyLabel}
          accessibilityRole="button"
          className="bg-brand flex-1 items-center justify-center rounded-full py-3"
          onPress={apply}
        >
          <Text className="text-body-2 text-background font-bold">
            {applyLabel}
          </Text>
        </Touchable>
      </View>
    </>
  );
}

export function ShopFilterSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose(): void;
}) {
  return (
    <BottomSheet onClose={onClose} title="Filter" visible={visible}>
      <FilterSheetContent onClose={onClose} />
    </BottomSheet>
  );
}

// 정렬 행(px-5 py-4 + body-2 한 줄 = 51)과 같은 크기의 막대. 정렬 옵션은 보통 4~5개라 4행을 둔다.
function SortRowsSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            height: 51,
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <Shimmer height={13} radius={4} width="45%" />
        </View>
      ))}
    </>
  );
}

function SortSheetContent({ onClose }: { onClose(): void }) {
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, fetchStatus, refetch } =
    useProductSortOptions();
  const sortColumn = useShopFilterStore((s) => s.sortColumn);
  const sort = useShopFilterStore((s) => s.sort);
  const setFilter = useShopFilterStore((s) => s.setFilter);

  let body: ReactNode;
  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (isPending) {
    body = <SortRowsSkeleton />;
  } else if (isError) {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (!data || data.list.length === 0) {
    body = <EmptyNote text="No sort options" />;
  } else {
    body = data.list.map((option) => {
      const selected = option.sortColumn === sortColumn && option.sort === sort;
      return (
        <Touchable
          accessibilityLabel={option.name}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          className="flex-row items-center justify-between px-5 py-4"
          key={option.id}
          onPress={() => {
            // 정렬은 draft·적용 단계 없이 고르는 즉시 반영한다.
            setFilter({ sortColumn: option.sortColumn, sort: option.sort });
            onClose();
          }}
        >
          <Text
            className={
              selected
                ? "text-body-2 text-brand font-bold"
                : "text-body-2 text-foreground"
            }
          >
            {option.name}
          </Text>
          {selected ? <Text className="text-body-2 text-brand">✓</Text> : null}
        </Touchable>
      );
    });
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
      style={{ flexShrink: 1 }}
    >
      {body}
    </ScrollView>
  );
}

export function ShopSortSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose(): void;
}) {
  return (
    <BottomSheet onClose={onClose} title="Sort by" visible={visible}>
      <SortSheetContent onClose={onClose} />
    </BottomSheet>
  );
}
