import { Image } from "expo-image";
import { FlatList, Text, View } from "react-native";

import type {
  BrandPromotionCoupon,
  BrandPromotionEvent,
} from "@shared/services/brandPromotion";
import { Section } from "@shared/ui/section";

import { Spacing } from "@/constants/theme";

const CARD_WIDTH = 280;
const COUPON_IMAGE_HEIGHT = 200;
const DESCRIPTION_LINES = 2;
const EXPIRED = "EXPIRED";
/** 못 쓰는 쿠폰을 덮는 투명도. 웹은 같은 자리에 'expired' 이미지를 깐다. */
const EXPIRED_OPACITY = 0.4;

function CouponCard({ coupon }: { coupon: BrandPromotionCoupon }) {
  const isExpired = coupon.status === EXPIRED;

  return (
    <View
      accessibilityLabel={isExpired ? `${coupon.title}, expired` : coupon.title}
      className="border-neutral-subtle rounded-lg border p-4"
      style={{ width: CARD_WIDTH, opacity: isExpired ? EXPIRED_OPACITY : 1 }}
    >
      <Text className="text-body-2 text-foreground font-bold" numberOfLines={1}>
        {coupon.title}
      </Text>
      <Text
        className="text-body-3 text-neutral"
        numberOfLines={DESCRIPTION_LINES}
        style={{ marginTop: Spacing.tight }}
      >
        {coupon.description}
      </Text>
      <Image
        contentFit="cover"
        source={coupon.imageUrl}
        style={{
          width: "100%",
          height: COUPON_IMAGE_HEIGHT,
          borderRadius: 8,
          marginTop: Spacing.tight,
        }}
        transition={200}
      />
      {isExpired ? (
        // 흐리게만 두면 "이미지가 아직 안 떴다"로 읽힌다. 한 마디로 이유를 말한다.
        <Text className="text-body-5 text-danger mt-2 font-bold">Expired</Text>
      ) : null}
    </View>
  );
}

/**
 * 온라인 이벤트 쿠폰. 이벤트마다 제목 하나와 쿠폰 줄 하나다.
 *
 * dev 응답의 eventList 가 비어 있어 실제로 그려지는 것을 본 적이 없다 —
 * 타입만 보고 지은 섹션이다.
 */
export function BrandOnlineEvent({
  eventList,
}: {
  eventList: BrandPromotionEvent[];
}) {
  const events = eventList.filter((event) => event.couponList.length > 0);

  if (events.length === 0) return null;

  return (
    <>
      {events.map((event) => (
        <Section key={event.id} title={event.title}>
          <FlatList
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            data={event.couponList}
            horizontal
            keyExtractor={(coupon) => String(coupon.id)}
            renderItem={({ item }) => <CouponCard coupon={item} />}
            showsHorizontalScrollIndicator={false}
          />
        </Section>
      ))}
    </>
  );
}
