import { Image } from "expo-image";
import { Dimensions, Text, View } from "react-native";

import { Spacing } from "@/constants/theme";

// 섹션 이미지는 원본 비율을 모르는 채로 자리를 잡아야 해서 높이를 고정한다.
const SECTION_IMAGE_HEIGHT = 220;
const IMAGE_GAP = 12;
// 웹 모바일 구간 간격(50~90px)과 같은 결로 섹션 사이를 크게 띄운다 — 장 사이 간격이다.
export const SECTION_GAP = Spacing.chapter;
// 제목/본문/이미지 블록 사이 간격.
const BLOCK_GAP = Spacing.inner;
const CONTENT_LINE_HEIGHT = 26;

const PAGE_PADDING = 20;
// 웹 브랜드 페이지의 모바일 구간: 208x320 이미지를 40 간격으로 좌/우 번갈아 세운다.
// 폭을 비율로 잡아 390pt 에서 210x323 이 되게 한다 — 웹 값과 사실상 같고 화면 폭을 따라간다.
const STAGGERED_WIDTH_RATIO = 0.6;
const STAGGERED_ASPECT = 208 / 320;
const STAGGERED_GAP = 40;

interface SectionImagesProps {
  uris: string[];
  /**
   * stack: 전체 폭 이미지를 쌓는다 (뉴스·아티클).
   * staggered: 좁은 이미지를 좌/우 번갈아 세운다 (브랜드).
   */
  layout?: "stack" | "staggered";
}

export function SectionImages({ uris, layout = "stack" }: SectionImagesProps) {
  // 이미지가 없으면 빈 블록도, 빈 간격도 만들지 않는다.
  if (uris.length === 0) {
    return null;
  }

  if (layout === "staggered") {
    const width = Math.round(
      (Dimensions.get("window").width - PAGE_PADDING * 2) *
        STAGGERED_WIDTH_RATIO,
    );

    return (
      <View className="px-5" style={{ gap: STAGGERED_GAP }}>
        {uris.map((uri, index) => (
          <View
            // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}-${uri}`}
            style={{
              alignItems: index % 2 === 1 ? "flex-end" : "flex-start",
            }}
          >
            <Image
              contentFit="cover"
              source={uri}
              style={{
                width,
                height: Math.round(width / STAGGERED_ASPECT),
              }}
              transition={200}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="px-5" style={{ gap: IMAGE_GAP }}>
      {uris.map((uri, index) => (
        <Image
          contentFit="cover"
          // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
          // eslint-disable-next-line react/no-array-index-key
          key={`${index}-${uri}`}
          source={uri}
          style={{
            width: "100%",
            height: SECTION_IMAGE_HEIGHT,
            borderRadius: 12,
          }}
          transition={200}
        />
      ))}
    </View>
  );
}

export interface DetailSectionContent {
  title?: string;
  /** 뉴스·아티클에만 있다. 브랜드 섹션에는 없다. */
  subTitle?: string;
  content?: string;
  imageList: string[];
}

/**
 * 상세 화면 본문 섹션. 뉴스·아티클·브랜드가 같은 리듬을 쓴다:
 * 제목 → 소제목 → 본문 → 이미지, 모두 좌측 정렬.
 */
interface DetailSectionProps {
  section: DetailSectionContent;
  imageLayout?: SectionImagesProps["layout"];
}

export function DetailSection({
  section,
  imageLayout = "stack",
}: DetailSectionProps) {
  const hasText = Boolean(section.title || section.subTitle || section.content);

  return (
    <View style={{ marginTop: SECTION_GAP, gap: BLOCK_GAP }}>
      {hasText ? (
        <View className="px-5" style={{ gap: 12 }}>
          {section.title ? (
            <Text className="text-title-4 text-foreground text-left font-semibold">
              {section.title}
            </Text>
          ) : null}
          {section.subTitle ? (
            <Text className="text-body-2 text-foreground text-left font-semibold">
              {section.subTitle}
            </Text>
          ) : null}
          {section.content ? (
            <Text
              className="text-body-2 text-foreground text-left"
              style={{ lineHeight: CONTENT_LINE_HEIGHT }}
            >
              {section.content}
            </Text>
          ) : null}
        </View>
      ) : null}
      <SectionImages layout={imageLayout} uris={section.imageList} />
    </View>
  );
}
