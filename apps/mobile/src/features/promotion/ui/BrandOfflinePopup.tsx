import { useState } from "react";

import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";

import { formatDate } from "@shared/lib/utils/formatDate";
import type { BrandPromotionPopup } from "@shared/services/brandPromotion";
import { BUTTON_HEIGHT, Button } from "@shared/ui/button";
import { CHIP_GAP, Chip } from "@shared/ui/chip";
import { Section } from "@shared/ui/section";
import {
  CHIP_HEIGHT,
  LINE_BODY_2,
  LINE_BODY_3,
  LINE_BODY_5,
} from "@shared/ui/skeleton";
import { SlideCarousel } from "@shared/ui/slide-pager/SlideCarousel";

import { Spacing } from "@/constants/theme";

export const POPUP_IMAGE_HEIGHT = 230;
export const POPUP_TABS_HEIGHT = CHIP_HEIGHT;
const LABEL_WIDTH = 72;
const ROW_GAP = Spacing.tight;
/** 주소는 한 줄에 안 들어간다. 두 줄 상자로 못 박아 팝업마다 블록 높이가 출렁이지 않게 한다. */
const ADDRESS_LINES = 2;
const DESCRIPTION_LINES = 4;
const DESCRIPTION_LINE_HEIGHT = 22;

/**
 * 제목 + 네 줄 + 설명 + 지도 버튼. 스켈레톤이 같은 값을 쓴다.
 *
 * 좌표가 없는 팝업은 지도 버튼이 없어 56pt 만큼 짧아진다. dev 의 팝업에는 좌표가 다 있고,
 * 블록이 짧아지는 쪽은 스켈레톤이 남긴 자리를 덜 쓰는 것이라 아래가 겹치지는 않는다.
 */
export const POPUP_INFO_HEIGHT =
  LINE_BODY_2 +
  ROW_GAP +
  (LINE_BODY_3 * 3 + ROW_GAP * 3 + LINE_BODY_3 * ADDRESS_LINES) +
  ROW_GAP +
  LINE_BODY_5 +
  8 +
  DESCRIPTION_LINE_HEIGHT * DESCRIPTION_LINES +
  ROW_GAP +
  BUTTON_HEIGHT.md;

/** 좌표는 문자열로 온다("37.5826"). 숫자가 아닌 값이 오면 지도를 열지 않는다. */
const COORDINATE = /^-?\d+(?:\.\d+)?$/;

/**
 * 웹은 이 자리에 구글 지도를 iframe 으로 박는다. 폰에서는 지도를 화면 안에 끼워 넣는 대신
 * 기기의 지도 앱으로 넘긴다 — 길찾기도 저장도 거기서 되고, 새 의존성도 필요 없다.
 * 주소가 아니라 좌표로 보내는 것은 웹과 같다(주소 검색은 같은 이름의 다른 가게를 집는다).
 */
const mapUrl = (popup: BrandPromotionPopup) => {
  if (
    !COORDINATE.test(popup.latitude ?? "") ||
    !COORDINATE.test(popup.longitude ?? "")
  ) {
    return undefined;
  }

  return `https://www.google.com/maps/search/?api=1&query=${popup.latitude},${popup.longitude}`;
};

/**
 * 상시 진행인 팝업은 끝나는 날에 아주 먼 미래(dev 는 2399-01-01)가 온다.
 * 웹과 같은 기준(2300년 이후)으로 "끝이 없다"로 읽고 끝 날짜를 비운다.
 */
const ENDLESS_YEAR = 2300;

const formatPeriod = (popup: BrandPromotionPopup) => {
  const start = formatDate(popup.startDate);
  if (!popup.endDate) return start;

  const end = new Date(popup.endDate);
  if (Number.isNaN(end.getTime()) || end.getFullYear() >= ENDLESS_YEAR) {
    return `${start} ~`;
  }

  return `${start} ~ ${formatDate(popup.endDate)}`;
};

const formatHours = (popup: BrandPromotionPopup) =>
  popup.endTime ? `${popup.startTime} ~ ${popup.endTime}` : popup.startTime;

interface InfoRowProps {
  label: string;
  value: string;
  /** 한 줄에 안 들어가는 값만 줄 수를 늘린다. 자리 높이는 그 줄 수로 고정된다. */
  lines?: number;
}

function InfoRow({ label, value, lines = 1 }: InfoRowProps) {
  return (
    <View className="flex-row">
      <Text className="text-body-3 text-neutral" style={{ width: LABEL_WIDTH }}>
        {label}
      </Text>
      {/* 높이를 상자로 못 박는다 — 값이 한 줄로 와도 두 줄 자리를 유지해야 스켈레톤과 맞는다. */}
      <View style={{ flex: 1, height: LINE_BODY_3 * lines }}>
        <Text
          className="text-body-3 text-foreground"
          numberOfLines={lines}
          style={{ lineHeight: LINE_BODY_3 }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/**
 * 오프라인·팝업 일정. 웹은 이미지 슬라이더 옆에 정보를 세우고 그 아래 지도를 깔지만,
 * 폰에서는 세로로 쌓고, 지도는 화면에 박는 대신 기기의 지도 앱을 여는 버튼으로 둔다.
 *
 * 일정이 둘 이상이면 시작일 알약으로 고른다. 고른 것을 다시 눌러도 비워지지 않는다.
 */
export function BrandOfflinePopup({
  popupList,
}: {
  popupList: BrandPromotionPopup[];
}) {
  const { width } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<number>();

  if (popupList.length === 0) return null;

  const active =
    popupList.find((popup) => popup.id === selectedId) ?? popupList[0];
  const hasTabs = popupList.length > 1;
  const mapLink = mapUrl(active);

  return (
    <Section title="Offline & Pop-up Events">
      {hasTabs ? (
        <View style={{ height: POPUP_TABS_HEIGHT }}>
          <ScrollView
            accessibilityLabel="Pop-up schedule"
            contentContainerStyle={{ paddingHorizontal: 20, gap: CHIP_GAP }}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
          >
            {popupList.map((popup) => (
              <Chip
                key={popup.id}
                label={formatDate(popup.startDate)}
                onPress={() => setSelectedId(popup.id)}
                selected={popup.id === active.id}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
      {/* 팝업을 바꾸면 슬라이드도 첫 장으로 돌아가야 한다 — 내부 index 는 key 로 비운다. */}
      <View style={{ marginTop: hasTabs ? Spacing.tight : 0 }}>
        <SlideCarousel
          data={active.imageUrlList}
          key={active.id}
          keyExtractor={(uri) => uri}
          renderItem={(uri) => (
            <Image
              contentFit="cover"
              source={uri}
              style={{ width, height: POPUP_IMAGE_HEIGHT }}
              transition={200}
            />
          )}
        />
      </View>
      <View className="px-5" style={{ marginTop: Spacing.inner }}>
        <Text
          className="text-body-2 text-foreground font-bold"
          numberOfLines={1}
        >
          {active.title}
        </Text>
        <View style={{ marginTop: ROW_GAP, gap: ROW_GAP }}>
          <InfoRow label="Location" value={active.place} />
          <InfoRow label="Date" value={formatPeriod(active)} />
          <InfoRow label="Time" value={formatHours(active)} />
          {/* en.json 의 promotion_address 는 소문자 'address' 다. 위 세 줄과 나란히 놓으면
              그 줄만 오타처럼 보여 첫 글자만 올린다. */}
          <InfoRow
            label="Address"
            lines={ADDRESS_LINES}
            value={active.address}
          />
        </View>
        <Text
          className="text-body-5 text-neutral"
          style={{ marginTop: ROW_GAP }}
        >
          Description
        </Text>
        <Text
          className="text-body-3 text-foreground"
          numberOfLines={DESCRIPTION_LINES}
          style={{ marginTop: 8, lineHeight: DESCRIPTION_LINE_HEIGHT }}
        >
          {active.description}
        </Text>
        {mapLink ? (
          <Button
            accessibilityLabel={`Open ${active.place} in Maps`}
            label="Open in Maps"
            onPress={() => void Linking.openURL(mapLink)}
            size="md"
            style={{ marginTop: ROW_GAP }}
            variant="secondary"
          />
        ) : null}
      </View>
    </Section>
  );
}
