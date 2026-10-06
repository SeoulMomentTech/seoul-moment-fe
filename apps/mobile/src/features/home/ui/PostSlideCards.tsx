import { Image } from "expo-image";
import { Text, View } from "react-native";

import { formatDate } from "@shared/lib/utils/formatDate";
import { ARTICLE_IMAGE_HEIGHT, NEWS_CARD_HEIGHT } from "@shared/ui/skeleton";

// 아티클은 이미지와 글 사이가 넓다 (웹 max-sm:gap-[30px]).
const ARTICLE_GAP = 30;

const byline = (writer: string, createDate: string) =>
  [writer, formatDate(createDate)].filter(Boolean).join(" · ");

interface PostCardProps {
  title: string;
  content: string;
  writer: string;
  createDate: string;
  imageUrl: string;
}

/**
 * 뉴스 슬라이드 카드. 사진 위에 글을 얹는 구성이라 화면 끝까지 꽉 차고 좌우 여백이 없다.
 * 사진이 밝아도 흰 글씨가 읽히도록 웹과 같이 전체를 한 겹 어둡게 덮는다.
 */
export function NewsSlideCard({
  title,
  content,
  writer,
  createDate,
  imageUrl,
}: PostCardProps) {
  return (
    <View
      className="justify-end overflow-hidden"
      style={{ height: NEWS_CARD_HEIGHT }}
    >
      <Image
        contentFit="cover"
        source={imageUrl}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        transition={200}
      />
      {/* 사진 위 오버레이라 토큰 대신 검정 알파를 직접 쓴다. 웹의 bg-black/50 과 같은 자리. */}
      <View
        className="absolute bottom-0 left-0 right-0 top-0"
        style={{ backgroundColor: "rgba(0,0,0,0.42)" }}
      />
      <View className="px-5 pb-8">
        {/* 사진 위 글씨라 토큰 대신 흰색을 직접 쓴다. */}
        <Text
          className="text-body-1 font-bold"
          numberOfLines={2}
          style={{ color: "#FFFFFF" }}
        >
          {title}
        </Text>
        {content ? (
          <Text
            className="text-body-3 mt-3"
            numberOfLines={3}
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {content}
          </Text>
        ) : null}
        <Text
          className="text-body-3 mt-5"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {byline(writer, createDate)}
        </Text>
      </View>
    </View>
  );
}

/** 아티클 슬라이드 카드. 뉴스와 달리 글이 사진 아래에 놓여 좌우 여백을 가진다. */
export function ArticleSlideCard({
  title,
  content,
  writer,
  createDate,
  imageUrl,
}: PostCardProps) {
  return (
    <View className="px-5">
      <Image
        contentFit="cover"
        source={imageUrl}
        style={{ width: "100%", height: ARTICLE_IMAGE_HEIGHT }}
        transition={200}
      />
      <View style={{ marginTop: ARTICLE_GAP }}>
        <Text
          className="text-body-1 text-foreground font-bold"
          numberOfLines={2}
        >
          {title}
        </Text>
        {content ? (
          <Text className="text-body-3 text-neutral mt-3" numberOfLines={3}>
            {content}
          </Text>
        ) : null}
        <Text className="text-body-3 text-neutral mt-5">
          {byline(writer, createDate)}
        </Text>
      </View>
    </View>
  );
}
