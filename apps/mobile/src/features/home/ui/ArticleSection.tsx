import { View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomeArticle } from "../model/useHomeLists";

const LIST_HEIGHT = 290;

export function ArticleSection() {
  const { data: articles, isPending, isError, refetch } = useHomeArticle();

  if (isPending) {
    return (
      <Section title="Article">
        <SectionSkeleton height={LIST_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Article">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (!articles || articles.length === 0) return null;

  return (
    <Section title="Article">
      <View>
        {articles.map((item) => (
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
