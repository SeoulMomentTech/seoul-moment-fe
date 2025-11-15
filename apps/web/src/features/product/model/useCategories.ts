import useLanguage from "@shared/lib/hooks/useLanguage";
import { getCategories } from "@shared/services/category";

import { useSuspenseQuery } from "@tanstack/react-query";

const useCategories = () => {
  const languageCode = useLanguage();
  return useSuspenseQuery({
    queryKey: ["categories", languageCode],
    queryFn: () => getCategories({ languageCode }),
    select: (res) => res.data.list,
  });
};

export default useCategories;
