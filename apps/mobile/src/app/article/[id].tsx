import { useLocalSearchParams } from "expo-router";

import { useArticleDetail } from "@features/article";
import { DetailScreen } from "@features/detail";

export default function ArticleDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const query = useArticleDetail(id);

  // 앱에는 아티클 목록 화면이 없다(apps/web 도 마찬가지). 그래서 "View all" 은
  // 가장 가까운 콘텐츠 허브인 News 탭으로 보낸다. 아티클 목록 화면이 생기면 다시 연결해야 한다.
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
