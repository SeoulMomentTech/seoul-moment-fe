import { useState, type ReactNode } from "react";

import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useBrandFilter } from "../model/useBrandFilter";
import { useProductCategories } from "../model/useProductCategories";
import { useProductCount } from "../model/useProductCount";
import { useProductOptionFilters } from "../model/useProductOptionFilters";
import { useProductSortOptions } from "../model/useProductSortOptions";
import { useShopFilterStore } from "../model/useShopFilterStore";
import type { ShopFilter } from "../model/useShopFilterStore";

const SHEET_MAX_HEIGHT = "85%";
const SWATCH_SIZE = 14;
const LIST_SKELETON_HEIGHT = 56;

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose(): void;
  children: ReactNode;
}

/**
 * 바텀 시트 라이브러리가 없어서 Modal 로 만든다. 닫히면 Modal 이 children 을 내리므로,
 * 안에 둔 컴포넌트의 state(draft) 는 열 때마다 새로 시작한다.
 */
function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          onPress={onClose}
          // 딤 처리용 반투명 검정
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />
        <View
          className="bg-background"
          style={{
            maxHeight: SHEET_MAX_HEIGHT,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text className="text-title-4 text-foreground font-bold">
              {title}
            </Text>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
            >
              <Text className="text-body-1 text-neutral">✕</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

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
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={
        selected
          ? "border-brand flex-row items-center rounded-full border-2 px-4 py-2"
          : "border-neutral-subtle flex-row items-center rounded-full border px-4 py-2"
      }
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
            ? "text-body-3 text-brand font-bold"
            : "text-body-3 text-foreground"
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CollapsibleSection({
  title,
  hint,
  disabled = false,
  children,
}: {
  title: string;
  hint?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const expanded = open && !disabled;

  return (
    <View className="border-neutral-subtle border-b py-4">
      <Pressable
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded }}
        className="flex-row items-center justify-between px-5"
        disabled={disabled}
        onPress={() => setOpen((prev) => !prev)}
      >
        <View className="flex-1">
          <Text
            className={
              disabled
                ? "text-body-1 text-neutral font-bold"
                : "text-body-1 text-foreground font-bold"
            }
          >
            {title}
          </Text>
          {hint ? (
            <Text className="text-body-3 text-neutral mt-1">{hint}</Text>
          ) : null}
        </View>
        {disabled ? null : (
          <Text className="text-body-2 text-neutral">
            {expanded ? "−" : "+"}
          </Text>
        )}
      </Pressable>
      {expanded ? <View className="mt-3">{children}</View> : null}
    </View>
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

function CategorySection({
  categoryId,
  onSelect,
}: {
  categoryId?: number;
  onSelect(id: number | undefined): void;
}) {
  const { data, isPending, isError, fetchStatus, refetch } =
    useProductCategories();

  let body: ReactNode;
  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (isPending) {
    body = <SectionSkeleton height={LIST_SKELETON_HEIGHT} />;
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
              onSelect(item.id === categoryId ? undefined : item.id)
            }
            selected={item.id === categoryId}
          />
        ))}
      </ChipWrap>
    );
  }

  return <CollapsibleSection title="Category">{body}</CollapsibleSection>;
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
    body = <SectionSkeleton height={LIST_SKELETON_HEIGHT} />;
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

  return <CollapsibleSection title="Brand">{body}</CollapsibleSection>;
}

function OptionsSection({
  categoryId,
  optionIdList,
  onToggle,
}: {
  categoryId?: number;
  optionIdList: number[];
  onToggle(id: number): void;
}) {
  const { data, isPending, isError, fetchStatus, refetch } =
    useProductOptionFilters(categoryId);

  // product/filter 는 categoryId 가 필수라, 고르기 전에는 숨기지 않고 비활성 헤더와 안내만 보여 준다.
  // (쿼리가 꺼져 있으면 isPending 이 영원히 유지되므로 아래 가드보다 먼저 거른다.)
  if (categoryId == null) {
    return (
      <CollapsibleSection
        disabled
        hint="Select a category first"
        title="Options"
      >
        {null}
      </CollapsibleSection>
    );
  }

  let body: ReactNode;
  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (isPending) {
    body = <SectionSkeleton height={LIST_SKELETON_HEIGHT} />;
  } else if (isError) {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (!data || data.list.length === 0) {
    body = <EmptyNote text="No options for this category" />;
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

  return <CollapsibleSection title="Options">{body}</CollapsibleSection>;
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

  // 카테고리가 바뀌면 이전 카테고리의 옵션 id 는 의미가 없어서 같이 비운다.
  const selectCategory = (id: number | undefined) =>
    setDraft((prev) => ({ ...prev, categoryId: id, optionIdList: [] }));

  const selectBrand = (id: number | undefined) =>
    setDraft((prev) => ({ ...prev, brandId: id }));

  const toggleOption = (id: number) =>
    setDraft((prev) => ({
      ...prev,
      optionIdList: prev.optionIdList.includes(id)
        ? prev.optionIdList.filter((v) => v !== id)
        : [...prev.optionIdList, id],
    }));

  // draft 만 비운다. 정렬과 검색어는 시트 밖에서 정하는 값이라 남긴다.
  const resetDraft = () =>
    setDraft((prev) => ({
      search: prev.search,
      sortColumn: prev.sortColumn,
      sort: prev.sort,
      optionIdList: [],
    }));

  const apply = () => {
    setFilter(draft);
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
        <CategorySection
          categoryId={draft.categoryId}
          onSelect={selectCategory}
        />
        <BrandSection brandId={draft.brandId} onSelect={selectBrand} />
        <OptionsSection
          categoryId={draft.categoryId}
          onToggle={toggleOption}
          optionIdList={draft.optionIdList}
        />
      </ScrollView>
      <View
        className="border-neutral-subtle flex-row gap-3 border-t px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          accessibilityLabel="Reset filters"
          accessibilityRole="button"
          className="border-neutral-subtle items-center justify-center rounded-full border px-6 py-3"
          onPress={resetDraft}
        >
          <Text className="text-body-2 text-foreground font-bold">Reset</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={applyLabel}
          accessibilityRole="button"
          className="bg-brand flex-1 items-center justify-center rounded-full py-3"
          onPress={apply}
        >
          <Text className="text-body-2 text-background font-bold">
            {applyLabel}
          </Text>
        </Pressable>
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
    body = <SectionSkeleton height={LIST_SKELETON_HEIGHT} />;
  } else if (isError) {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (!data || data.list.length === 0) {
    body = <EmptyNote text="No sort options" />;
  } else {
    body = data.list.map((option) => {
      const selected = option.sortColumn === sortColumn && option.sort === sort;
      return (
        <Pressable
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
        </Pressable>
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
