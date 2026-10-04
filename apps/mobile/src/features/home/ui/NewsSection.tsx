import { View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomeNews } from "../model/useHomeLists";

const LIST_HEIGHT = 290;

export function NewsSection() {
  const { data: news, isPending, isError, refetch } = useHomeNews();

  if (isPending) {
    return (
      <Section title="News">
        <SectionSkeleton height={LIST_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="News">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (!news || news.length === 0) return null;

  return (
    <Section title="News">
      <View>
        {news.map((item) => (
          <PostRow
            createDate={item.createDate}
            imageUrl={item.homeImage}
            key={item.id}
            title={item.title}
            writer={item.writer}
          />
        ))}
      </View>
    </Section>
  );
}
