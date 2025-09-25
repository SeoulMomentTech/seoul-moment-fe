import { useSuspenseQuery } from "@tanstack/react-query";
import { getArticleList } from "@/shared/services/article";
import useLanguage from "./useLanguage";

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
