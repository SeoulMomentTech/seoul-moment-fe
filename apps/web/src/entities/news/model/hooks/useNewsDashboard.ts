import { useLanguage } from "@shared/lib/hooks";
import { getNewsDashboard } from "@shared/services/news";

import { useSuspenseQuery } from "@tanstack/react-query";

const useNewsDashboard = () => {
  const languageCode = useLanguage();

  return useSuspenseQuery({
    queryKey: ["news", "dashboard", languageCode],
    queryFn: () => getNewsDashboard({ languageCode }),
    select: (res) => res.data,
  });
};

export default useNewsDashboard;
