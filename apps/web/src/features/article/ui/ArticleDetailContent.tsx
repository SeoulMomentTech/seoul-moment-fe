import { ARTICLE_IN_ARTICLE_AD_SLOT } from "@shared/constants/ads";

import type { DetailContentProps } from "@widgets/detail";
import { DetailContent } from "@widgets/detail";

export const ArticleDetailContent = (props: DetailContentProps) => {
  return (
    <DetailContent {...props} inArticleAdSlot={ARTICLE_IN_ARTICLE_AD_SLOT} />
  );
};
