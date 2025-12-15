import { useAppQuery, useLanguage } from "@shared/lib/hooks";
import { getPartners } from "@shared/services/partner";

const usePartners = (id: number, enabled?: boolean) => {
  const languageCode = useLanguage();
  return useAppQuery({
    queryKey: ["partners", languageCode],
    queryFn: () => getPartners({ id, languageCode, country: languageCode }),
    enabled,
    select: (res) => res.data,
  });
};

export default usePartners;
