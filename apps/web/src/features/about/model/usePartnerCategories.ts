import { useLanguage } from "@shared/lib/hooks";
import { getPartnerCategories } from "@shared/services/partner";

import { useSuspenseQuery } from "@tanstack/react-query";

const usePartnerCategories = () => {
  const languageCode = useLanguage();

  const query = useSuspenseQuery({
    queryKey: ["about", "categories", languageCode],
    queryFn: () => getPartnerCategories({ languageCode }),
    select: (res) => {
      return res.data.list;
    },
  });

  const isEmpty = query.data ? query.data.length === 0 : true;

  return { ...query, isEmpty };
};

export default usePartnerCategories;
