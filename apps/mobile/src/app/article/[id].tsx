import { useLocalSearchParams } from "expo-router";

import { useArticleDetail } from "@features/article";
import { DetailScreen } from "@features/detail";

export default function ArticleDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const query = useArticleDetail(id);

  // The app has no article list screen (neither does apps/web), so "View all"
  // points at the News tab, the closest content hub. Should be repointed if
  // an article list screen is ever added.
  return (
    <DetailScreen
      getRelatedItems={(article) => article.lastArticle}
      id={id}
      query={query}
      relatedHeading="More Articles"
      relatedRoute="/article"
      relatedViewAllHref="/news"
    />
  );
}
