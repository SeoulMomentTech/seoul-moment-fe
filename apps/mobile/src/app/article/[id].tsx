import { useLocalSearchParams } from "expo-router";

import { useArticleDetail } from "@features/article";
import { DetailScreen } from "@features/detail";

export default function ArticleDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const query = useArticleDetail(id);

  // 아티클에는 탭이 없으므로 더보기 목적지를 넘기지 않는다.
  return (
    <DetailScreen
      getRelatedItems={(article) => article.lastArticle}
      id={id}
      query={query}
      relatedHeading="More Articles"
      relatedRoute="/article"
    />
  );
}
