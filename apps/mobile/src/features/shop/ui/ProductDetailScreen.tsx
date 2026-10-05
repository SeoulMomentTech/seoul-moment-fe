import { useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@entities/product/ui/ProductCard";
import type {
  GetProductDetailRes,
  ProductDetailOption,
} from "@shared/services/product";
import {
  BackButton,
  SCRIM_EXTRA_HEIGHT,
  StatusScreen,
  TopScrim,
} from "@shared/ui/detail-chrome";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import useProductDetail from "../model/useProductDetail";

const GALLERY_HEIGHT = 380;
const SKELETON_HEIGHT = 240;
const AVATAR_SIZE = 28;
const DOT_SIZE = 6;
// 점 그림자. iOS 는 shadow*, Android 는 elevation 만 먹으므로 둘 다 지정한다.
// 6pt 점이라 오프셋·반경을 키워 번짐이 아닌 짙은 테두리 느낌의 후광이 되게 한다. 검정은 사진 색과 무관하게 쓰는 값.
const DOT_SHADOW = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.5,
  shadowRadius: 2,
  elevation: 3,
} as const;
const RELATED_CARD_WIDTH = 150;
const RELATED_GAP = 12;
const LABEL_WIDTH = 96;
// detailImg 가 로드되기 전 자리를 잡는 임시 높이. 로드 후엔 원본 비율로 바뀐다.
const DETAIL_IMAGE_PLACEHOLDER_HEIGHT = 320;

// 웹 OPTION_AXIS_ORDER / 라벨과 같은 순서. 목록에 없는 타입(GENDER 등)은 웹처럼 그리지 않는다.
const OPTION_LABELS: readonly (readonly [string, string])[] = [
  ["COLOR", "Color"],
  ["SIZE", "Size"],
  ["VOLUME", "Volume"],
  ["TEXTURE", "Texture"],
  ["MATERIAL", "Material"],
  ["FIT", "Fit"],
];

const formatPrice = (value: number) => `NT$${value.toLocaleString("en-US")}`;

/** 옵션 객체를 정해진 순서의 (라벨, 값 문자열) 행으로 바꾼다. 값이 없는 타입은 뺀다. */
const toOptionRows = (option: ProductDetailOption | undefined) =>
  OPTION_LABELS.flatMap(([type, label]) => {
    const values = option?.[type];

    return values && values.length > 0
      ? [{ type, label, text: values.map((v) => v.value).join(" / ") }]
      : [];
  });

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row">
      <Text className="text-body-3 text-neutral" style={{ width: LABEL_WIDTH }}>
        {label}
      </Text>
      <Text className="text-body-3 text-foreground flex-1">{value}</Text>
    </View>
  );
}

function Gallery({ uris, height }: { uris: string[]; height: number }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const handleEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={{ height }}>
      <FlatList
        data={uris}
        horizontal
        // 페이지 폭이 화면 폭이라 오프셋 계산을 스크롤 끝에서 한 번만 한다.
        keyExtractor={(uri, index) => `${index}-${uri}`}
        onMomentumScrollEnd={handleEnd}
        pagingEnabled
        renderItem={({ item }) => (
          <Image
            contentFit="cover"
            source={item}
            style={{ width, height }}
            transition={200}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />
      {uris.length > 1 ? (
        <View
          className="absolute left-0 right-0 flex-row justify-center"
          pointerEvents="none"
          style={{ bottom: 12, gap: 6 }}
        >
          {uris.map((uri, index) => (
            <View
              // 정적 목록이라 index 키가 안전하다.
              // eslint-disable-next-line react/no-array-index-key
              key={`${index}-${uri}`}
              style={[
                {
                  width: index === page ? DOT_SIZE * 2 : DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: DOT_SIZE / 2,
                  // 사진 위 점이라 토큰 대신 흰색 계열을 직접 쓴다.
                  backgroundColor:
                    index === page ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  // 흰 배경 사진에서도 보이도록 옅은 검정 테두리를 둔다. 그림자만으로는 흰 점이 묻힌다.
                  // 어두운 사진에서는 테두리가 배경에 섞여 거의 드러나지 않는다.
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.3)",
                },
                DOT_SHADOW,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function PriceBlock({ product }: { product: GetProductDetailRes }) {
  const { price, discountPrice } = product;
  const hasDiscount = discountPrice > 0 && price > discountPrice;
  const current = discountPrice > 0 ? discountPrice : price;

  if (current <= 0) {
    return null;
  }

  const percent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  return (
    <View className="mt-4 flex-row items-baseline" style={{ gap: 8 }}>
      {hasDiscount && percent > 0 ? (
        <Text className="text-title-4 text-brand font-bold">{`${percent}%`}</Text>
      ) : null}
      <Text className="text-title-4 text-foreground font-bold">
        {formatPrice(current)}
      </Text>
      {hasDiscount ? (
        <Text
          className="text-body-3 text-neutral"
          style={{ textDecorationLine: "line-through" }}
        >
          {formatPrice(price)}
        </Text>
      ) : null}
    </View>
  );
}

function DetailImage({ uri }: { uri: string }) {
  // 원본 비율을 모르므로 로드 후 실제 크기로 aspectRatio 를 정해 폭 100%에 높이가 따라가게 한다.
  const [ratio, setRatio] = useState<number | null>(null);

  return (
    <Image
      contentFit="cover"
      onLoad={(e) => {
        const { width, height } = e.source;

        if (width > 0 && height > 0) setRatio(width / height);
      }}
      source={uri}
      style={
        ratio
          ? { width: "100%", aspectRatio: ratio }
          : { width: "100%", height: DETAIL_IMAGE_PLACEHOLDER_HEIGHT }
      }
    />
  );
}

function RelatedProducts({ items }: { items: GetProductDetailRes["relate"] }) {
  const router = useRouter();

  if (items.length === 0) {
    return null;
  }

  return (
    <View className="mt-12">
      <Text className="text-title-4 text-foreground mb-4 px-5 font-bold">
        Related Products
      </Text>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, gap: RELATED_GAP }}
        data={items}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            accessibilityLabel={item.productName}
            accessibilityRole="button"
            onPress={() => router.push(`/product/${item.id}`)}
            style={{ width: RELATED_CARD_WIDTH }}
          >
            <ProductCard product={item} />
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

/**
 * 상품 상세(읽기 전용). 담기·좋아요·옵션 선택은 장바구니와 로그인이 없어 의도적으로 뺐다.
 * 상태 분기(잘못된 id → 오프라인 → 로딩 → 에러 → 콘텐츠)는 DetailScreen 과 같은 순서이고,
 * 모든 분기에 뒤로가기 버튼이 있다.
 */
export function ProductDetailScreen({ id }: { id: number }) {
  const insets = useSafeAreaInsets();
  const {
    data: product,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useProductDetail(id);

  // 잘못된 id 는 쿼리가 enabled=false 로 idle 에 머문다. 스켈레톤 대신 에러를 보여준다.
  if (!Number.isFinite(id)) {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  if (isPending) {
    return (
      <StatusScreen>
        <SectionSkeleton height={SKELETON_HEIGHT} />
      </StatusScreen>
    );
  }

  if (isError || !product) {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  const optionRows = toOptionRows(product.option);
  const hasRating = product.review > 0;

  return (
    <View className="bg-background flex-1">
      {/* 스크림이 고정이라 글리프가 항상 어두운 띠 위에 놓이므로 light 가 안전하다. */}
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Gallery
          height={GALLERY_HEIGHT + insets.top}
          uris={product.subImage ?? []}
        />
        <View className="px-5 pt-5">
          <View className="flex-row items-center">
            {product.brand.profileImg ? (
              <Image
                contentFit="cover"
                source={product.brand.profileImg}
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  marginRight: 8,
                }}
              />
            ) : null}
            <Text
              className="text-body-3 text-neutral flex-1 font-semibold"
              numberOfLines={1}
            >
              {product.brand.name}
            </Text>
          </View>
          <Text className="text-title-4 text-foreground mt-3 font-bold">
            {product.name}
          </Text>
          <PriceBlock product={product} />
          {hasRating ? (
            <Text className="text-body-3 text-foreground mt-3">
              {`★ ${product.reviewAverage} (${product.review.toLocaleString("en-US")})`}
              {product.like > 0
                ? `  ·  ${product.like.toLocaleString("en-US")} likes`
                : ""}
            </Text>
          ) : null}
        </View>
        <View
          className="border-neutral-subtle mx-5 mt-6 border-t pt-5"
          style={{ gap: 12 }}
        >
          {optionRows.map((row) => (
            <SpecRow key={row.type} label={row.label} value={row.text} />
          ))}
          {product.origin ? (
            <SpecRow label="Origin" value={product.origin} />
          ) : null}
          {product.shippingInfo > 0 ? (
            <SpecRow
              label="Shipping"
              value={`Within ${product.shippingInfo} days`}
            />
          ) : null}
          {product.shippingCost > 0 ? (
            <SpecRow
              label="Shipping fee"
              value={formatPrice(product.shippingCost)}
            />
          ) : null}
        </View>
        {product.detailImg ? (
          <View className="mt-10">
            <DetailImage uri={product.detailImg} />
          </View>
        ) : null}
        <RelatedProducts items={product.relate ?? []} />
        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
      <TopScrim height={insets.top + SCRIM_EXTRA_HEIGHT} />
      <BackButton />
    </View>
  );
}
