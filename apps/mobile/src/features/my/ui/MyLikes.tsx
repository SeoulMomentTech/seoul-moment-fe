import { useState, type ReactNode } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Alert, FlatList, Text, View } from "react-native";

import { useProductCategories } from "@entities/product/model/useProductCategories";
import { CHIP_GAP, Chip } from "@shared/ui/chip";
import {
  ClockIcon,
  EMPTY_ICON_SIZE,
  HeartIcon,
  HeartOutlineIcon,
} from "@shared/ui/icons";
import { Touchable } from "@shared/ui/press";
import { Section } from "@shared/ui/section";
import { EmptyState, SectionError } from "@shared/ui/section-state";
import {
  CategoryChipsSkeleton,
  MY_BRAND_AVATAR_SIZE,
  MY_BRAND_ROW_HEIGHT,
  MY_LIKE_ROW_HEIGHT,
  MY_LIKE_THUMB_SIZE,
  MyBrandListSkeleton,
  MyLikeListSkeleton,
} from "@shared/ui/skeleton";

import { Spacing } from "@/constants/theme";

import { useLikedBrands } from "../model/useLikedBrands";
import { useLikedProducts } from "../model/useLikedProducts";
import { useRecentProducts } from "../model/useRecentProducts";
import { useUnlikeBrand } from "../model/useUnlikeBrand";
import { useUnlikeProduct } from "../model/useUnlikeProduct";

// 좌우 여백. 앱의 모든 목록이 쓰는 값이다(px-5).
const PAGE_PADDING = 20;
// 하트의 터치 상자. 아이콘은 24 지만 상자는 44 여야 손가락에 맞는다.
const HEART_TOUCH = 44;
// 빈 화면 아이콘 색. SVG 는 className 을 못 받아 --neutral-600 값을 직접 쓴다.
const EMPTY_ICON_COLOR = "#707070";
const HEART_ICON = 24;
// --brand-500. SVG 는 className 을 못 받아 토큰 값을 직접 넘긴다.
const BRAND_COLOR = "#f37b2a";
// 탭 한 칸의 높이. 글자 한 줄(19)뿐이라 44 로 띄워 터치 최소치를 맞춘다.
const TAB_HEIGHT = 44;

type LikesTab = "product" | "brand" | "recent";

const TABS: { value: LikesTab; label: string }[] = [
  { value: "product", label: "Products" },
  { value: "brand", label: "Brands" },
  { value: "recent", label: "Recently viewed" },
];

/**
 * 관심 목록. 로그인한 사람에게만 그려진다.
 *
 * 세 탭이 한 제목 아래 모여 있는 것은 셋 다 "내가 남긴 자취"이기 때문이다.
 * 어느 탭이 실패해도 이 블록 밖(이름·이메일, 아래 메뉴)은 건드리지 않는다 —
 * 실패는 언제나 탭 본문 안에서 끝난다.
 */
export function MyLikes() {
  const [tab, setTab] = useState<LikesTab>("product");

  return (
    // 아래 메뉴가 마지막 줄에 붙지 않도록 이 블록이 제 아래 여백을 쥔다.
    <View style={{ paddingBottom: Spacing.section }}>
      <Section title="Likes">
        <TabBar onChange={setTab} value={tab} />
        {tab === "product" ? <LikedProductsTab /> : null}
        {tab === "brand" ? <LikedBrandsTab /> : null}
        {tab === "recent" ? <RecentTab /> : null}
      </Section>
    </View>
  );
}

/**
 * 탭 줄. 고른 탭은 검은 밑줄로 나타낸다 — 바로 아래 카테고리 칩이 주황으로 "고름"을
 * 말하고 있어, 둘 다 주황이면 탭과 필터가 같은 축으로 보인다. 탭은 무엇을 보는지,
 * 칩은 그 안에서 무엇만 보는지라 서로 다른 축이다.
 *
 * 고를 때 글자 굵기는 바꾸지 않는다. 굵어지면 글자 폭이 늘어 옆 탭이 밀린다(칩과 같은 이유).
 */
function TabBar({
  value,
  onChange,
}: {
  value: LikesTab;
  onChange(next: LikesTab): void;
}) {
  return (
    <View className="border-neutral-subtle border-b">
      {/* 간격은 12 다. 24 로 벌리면 "Recently viewed" 까지 세 칸이 320pt 폭(SE)에서 넘친다. */}
      <View className="flex-row px-5" style={{ gap: Spacing.tight }}>
        {TABS.map((item) => {
          const selected = item.value === value;

          return (
            <Touchable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "border-foreground justify-center border-b-2"
                  : "justify-center border-b-2 border-transparent"
              }
              key={item.value}
              onPress={() => onChange(item.value)}
              style={{ height: TAB_HEIGHT }}
            >
              <Text
                className={
                  selected
                    ? "text-body-2 text-foreground"
                    : "text-body-2 text-neutral"
                }
              >
                {item.label}
              </Text>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
}

/** 해제가 실패했을 때. 줄이 되살아나는 이유를 말하지 않으면 눌린 적이 없던 것처럼 보인다. */
const warnUnlikeFailed = () =>
  Alert.alert("Couldn't update your likes", "Please try again in a moment.");

function LikedProductsTab() {
  const [productCategoryId, setProductCategoryId] = useState<number>();
  const { data, isPending, isError, fetchStatus, refetch } =
    useLikedProducts(productCategoryId);
  const unlike = useUnlikeProduct();

  // 가드 순서는 앱의 다른 목록과 같다 — 오프라인 → 로딩 → 실패 → 빈 목록 → 그리기.
  // 오프라인에서는 요청이 fetchStatus: "paused" 로 멈춘 채 isPending 이 유지되므로,
  // 이 갈래를 먼저 두지 않으면 영영 스켈레톤만 보인다.
  // 칩 줄은 어느 갈래에서도 남는다 — 목록을 못 받았다고 고른 카테고리까지 사라지면
  // 재시도한 뒤 무엇을 보고 있었는지 알 수 없다.
  let body: ReactNode;
  if (isPending && fetchStatus === "paused") {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (isPending) {
    body = <MyLikeListSkeleton />;
  } else if (isError) {
    body = <SectionError onRetry={() => void refetch()} />;
  } else if (!data || data.list.length === 0) {
    body = (
      <EmptyState
        hint="Tap the heart on a product to keep it here."
        icon={
          <HeartOutlineIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />
        }
        message="No liked products yet"
      />
    );
  } else {
    body = data.list.map((item) => (
      <ProductRow
        brandName={item.brandName}
        discountPrice={item.discountPrice}
        imageUrl={item.imageUrl}
        key={item.productItemId}
        onUnlike={() =>
          unlike.mutate(item.productItemId, { onError: warnUnlikeFailed })
        }
        price={item.price}
        productItemId={item.productItemId}
        productName={item.productName}
      />
    ));
  }

  return (
    <View>
      <CategoryFilter
        onChange={setProductCategoryId}
        value={productCategoryId}
      />
      {body}
    </View>
  );
}

function LikedBrandsTab() {
  const { data, isPending, isError, fetchStatus, refetch } = useLikedBrands();
  const unlike = useUnlikeBrand();

  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <MyBrandListSkeleton />;

  if (isError) return <SectionError onRetry={() => void refetch()} />;

  if (!data || data.list.length === 0) {
    return (
      <EmptyState
        hint="Brands you follow will show up here."
        icon={
          <HeartOutlineIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />
        }
        message="No liked brands yet"
      />
    );
  }

  return (
    <View>
      {data.list.map((brand) => (
        <BrandRow
          brandId={brand.brandId}
          brandName={brand.brandName}
          englishBrandName={brand.englishBrandName}
          key={brand.brandId}
          likeCount={brand.totalLikeCount}
          onUnlike={() =>
            unlike.mutate(brand.brandId, { onError: warnUnlikeFailed })
          }
        />
      ))}
    </View>
  );
}

function RecentTab() {
  const { data, isPending, isError, fetchStatus, refetch } =
    useRecentProducts();

  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <MyLikeListSkeleton />;

  if (isError) return <SectionError onRetry={() => void refetch()} />;

  if (!data || data.list.length === 0) {
    return (
      <EmptyState
        hint="Products you open will show up here."
        icon={<ClockIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />}
        message="Nothing viewed yet"
      />
    );
  }

  return (
    <View>
      {data.list.map((item) => (
        <ProductRow
          brandName={item.brandName}
          discountPrice={item.discountPrice}
          imageUrl={item.imageUrl}
          key={item.productItemId}
          price={item.price}
          productItemId={item.productItemId}
          productName={item.productName}
        />
      ))}
    </View>
  );
}

/**
 * 관심 상품을 좁히는 칩 줄. 상품 목록 위 칩과 같은 알약이다.
 * 이 줄이 실패하면 아무것도 그리지 않는다 — 좁히지 못할 뿐 목록은 멀쩡하고,
 * 필터가 없다는 사실을 에러 줄로 알릴 만큼 중요하지 않다.
 */
function CategoryFilter({
  value,
  onChange,
}: {
  value?: number;
  onChange(next: number | undefined): void;
}) {
  const { data, isPending, isError, fetchStatus } = useProductCategories();

  if (isPending && fetchStatus === "paused") return null;

  if (isPending) {
    return (
      <View style={{ marginTop: Spacing.tight }}>
        <CategoryChipsSkeleton />
      </View>
    );
  }

  if (isError || !data || data.list.length === 0) return null;

  return (
    <FlatList
      ListHeaderComponent={
        <Chip
          label="All"
          onPress={() => onChange(undefined)}
          selected={value == null}
        />
      }
      contentContainerStyle={{
        paddingHorizontal: PAGE_PADDING,
        gap: CHIP_GAP,
      }}
      data={data.list}
      horizontal
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <Chip
          label={item.name}
          // 이미 고른 카테고리를 다시 누르면 해제한다(필터 시트와 같은 규칙).
          onPress={() => onChange(item.id === value ? undefined : item.id)}
          selected={item.id === value}
        />
      )}
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: Spacing.tight, flexGrow: 0 }}
    />
  );
}

/** 할인가가 0 이거나 정가보다 크면 할인이 아니다. 줄 하나에 가격 하나만 쓴다. */
const displayPrice = (price: number, discountPrice?: number) => {
  const discounted =
    typeof discountPrice === "number" &&
    discountPrice > 0 &&
    discountPrice < price;

  return `NT$${(discounted ? discountPrice : price).toLocaleString("en-US")}`;
};

/**
 * 상품 한 줄. 세 글줄의 역할은 ProductCard 와 같다 —
 * 브랜드는 메타(body-5), 이름은 본문(body-3), 가격은 눈이 찾는 줄(body-2 bold).
 *
 * 하트를 링크 안에 넣지 않는다. 안에 두면 하트를 눌러도 상품 화면으로 떠나 버린다.
 */
function ProductRow({
  productItemId,
  brandName,
  productName,
  imageUrl,
  price,
  discountPrice,
  onUnlike,
}: {
  productItemId: number;
  brandName: string;
  productName: string;
  imageUrl: string;
  price: number;
  discountPrice?: number;
  /** 없으면 하트를 그리지 않는다(최근 본 상품). */
  onUnlike?(): void;
}) {
  const router = useRouter();

  return (
    <View
      className="flex-row items-center px-5"
      style={{ height: MY_LIKE_ROW_HEIGHT }}
    >
      <Touchable
        accessibilityLabel={`${brandName} ${productName}`}
        accessibilityRole="button"
        className="flex-1 flex-row items-center"
        onPress={() => router.push(`/product/${productItemId}`)}
      >
        <Image
          contentFit="cover"
          source={imageUrl}
          // 사진이 404 이거나 느려도 줄 높이가 흔들리지 않게 크기를 못 박는다.
          style={{
            width: MY_LIKE_THUMB_SIZE,
            height: MY_LIKE_THUMB_SIZE,
            borderRadius: 8,
          }}
          transition={200}
        />
        <View className="flex-1" style={{ marginLeft: Spacing.tight }}>
          <Text className="text-body-5 text-neutral" numberOfLines={1}>
            {brandName}
          </Text>
          <Text className="text-body-3 text-foreground" numberOfLines={1}>
            {productName}
          </Text>
          <Text className="text-body-2 text-foreground mt-1 font-bold">
            {displayPrice(price, discountPrice)}
          </Text>
        </View>
      </Touchable>
      {onUnlike ? (
        <HeartButton
          label={`Remove ${productName} from likes`}
          onPress={onUnlike}
        />
      ) : null}
    </View>
  );
}

/**
 * 브랜드 한 줄. 상품 줄과 달리 사진이 없어서, 그 자리에 머리글자 원을 둔다 —
 * 없으면 글자 두 줄만 떠 있어 바로 위 상품 줄들과 다른 목록처럼 보인다.
 */
function BrandRow({
  brandId,
  brandName,
  englishBrandName,
  likeCount,
  onUnlike,
}: {
  brandId: number;
  brandName: string;
  englishBrandName: string;
  likeCount: number;
  onUnlike(): void;
}) {
  const router = useRouter();

  const title = englishBrandName || brandName;
  // 한국어로 보면 brandName 이 "취(Chwi)", englishBrandName 이 "Chwi" 라 두 줄이 다르다.
  // 영어로 보면 둘이 같아지므로 그때는 좋아요 수만 남긴다 (ShopParts 의 BrandHeader 와 같은 규칙).
  const meta =
    brandName && brandName !== title
      ? `${brandName} · ♡ ${likeCount.toLocaleString("en-US")}`
      : `♡ ${likeCount.toLocaleString("en-US")}`;

  return (
    <View
      className="flex-row items-center px-5"
      style={{ height: MY_BRAND_ROW_HEIGHT }}
    >
      <Touchable
        accessibilityLabel={`View ${title}`}
        accessibilityRole="button"
        className="flex-1 flex-row items-center"
        onPress={() => router.push(`/brand/${brandId}`)}
      >
        <View
          className="bg-surface-muted items-center justify-center"
          style={{
            width: MY_BRAND_AVATAR_SIZE,
            height: MY_BRAND_AVATAR_SIZE,
            borderRadius: MY_BRAND_AVATAR_SIZE / 2,
          }}
        >
          <Text className="text-body-2 text-neutral font-bold">
            {title.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1" style={{ marginLeft: Spacing.tight }}>
          <Text className="text-body-2 text-foreground" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-body-5 text-neutral mt-1" numberOfLines={1}>
            {meta}
          </Text>
        </View>
      </Touchable>
      <HeartButton label={`Remove ${title} from likes`} onPress={onUnlike} />
    </View>
  );
}

/**
 * 채워진 하트. 목록에 있는 줄은 모두 고른 것이라 켜진 상태로만 그려지고,
 * 누르면 그 줄이 목록에서 빠진다. 주황은 "고른 것"을 뜻하는 앱의 한 가지 쓰임이다.
 */
function HeartButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Touchable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: true }}
      className="items-center justify-center"
      onPress={onPress}
      style={{ width: HEART_TOUCH, height: HEART_TOUCH }}
    >
      <HeartIcon color={BRAND_COLOR} size={HEART_ICON} />
    </Touchable>
  );
}
