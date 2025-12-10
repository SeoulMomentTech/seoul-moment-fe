import { useLanguage } from "@shared/lib/hooks";
import { getArticleList } from "@shared/services/article";

import { useSuspenseQuery } from "@tanstack/react-query";

interface UseArticleProps {
  count: number;
}

const useArticle = ({ count }: UseArticleProps) => {
  const languageCode = useLanguage();

  return useSuspenseQuery({
    queryKey: ["article", languageCode, count],
    queryFn: () => getArticleList({ count, languageCode }),
    select: (res) => res.data.list,
  });
};

export default useArticle;
