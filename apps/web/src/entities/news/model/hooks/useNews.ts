import { useSuspenseQuery } from "@tanstack/react-query";
import useLanguage from "@shared/lib/hooks/useLanguage";
import { getNewsList } from "@shared/services/news";

interface UseNewsProps {
  count: number;
}

const useNews = ({ count }: UseNewsProps) => {
  const languageCode = useLanguage();

  return useSuspenseQuery({
    queryKey: ["news", languageCode, count],
    queryFn: () => getNewsList({ count, languageCode }),
    select: (res) => res.data.list,
  });
};

export default useNews;
