import { useAppQuery, useLanguage } from "@shared/lib/hooks";
import { getPartners } from "@shared/services/partner";

import { keepPreviousData } from "@tanstack/react-query";

const usePartners = (id: number, enabled?: boolean) => {
  const languageCode = useLanguage();
  return useAppQuery({
    queryKey: ["partners", id, languageCode],
    queryFn: () => getPartners({ id, languageCode, country: languageCode }),
    enabled,
    // 탭 전환 중 이전 카드를 유지해 리스트가 비었다 다시 채워지는 깜빡임을 막는다.
    placeholderData: keepPreviousData,
    select: (res) => res.data,
  });
};

export default usePartners;
