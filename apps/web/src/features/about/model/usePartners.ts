import { useLanguage } from "@shared/lib/hooks";
import { getPartners } from "@shared/services/partner";

import { useQuery } from "@tanstack/react-query";

const usePartners = (id: number, enabled?: boolean) => {
  const languageCode = useLanguage();
  return useQuery({
    queryKey: ["partners", languageCode],
    queryFn: () => getPartners({ id, languageCode, country: languageCode }),
    enabled,
    select: (res) => res.data,
  });
};

export default usePartners;
