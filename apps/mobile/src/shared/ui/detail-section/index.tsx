import { Image } from "expo-image";
import { Text, View } from "react-native";

// 섹션 이미지는 원본 비율을 모르는 채로 자리를 잡아야 해서 높이를 고정한다.
const SECTION_IMAGE_HEIGHT = 220;
const IMAGE_GAP = 12;
// 웹 모바일 구간 간격(50~90px)과 같은 결로 섹션 사이를 크게 띄운다.
export const SECTION_GAP = 64;
// 제목/본문/이미지 블록 사이 간격.
const BLOCK_GAP = 24;
const CONTENT_LINE_HEIGHT = 26;

export function SectionImages({ uris }: { uris: string[] }) {
  // 이미지가 없으면 빈 블록도, 빈 간격도 만들지 않는다.
  if (uris.length === 0) {
    return null;
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
export function DetailSection({ section }: { section: DetailSectionContent }) {
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
      <SectionImages uris={section.imageList} />
    </View>
  );
}
