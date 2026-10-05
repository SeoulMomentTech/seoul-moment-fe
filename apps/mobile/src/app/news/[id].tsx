import { useLocalSearchParams } from "expo-router";

import { DetailScreen } from "@features/detail";
import { useNewsDetail } from "@features/news";

export default function NewsDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const query = useNewsDetail(id);

  return (
    <DetailScreen
      getRelatedItems={(news) => news.lastNews}
      id={id}
      query={query}
      relatedHeading="More News"
      relatedRoute="/news"
      relatedViewAllHref="/news"
    />
  );
}
