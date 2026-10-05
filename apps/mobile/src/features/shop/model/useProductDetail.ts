import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetProductDetailRes } from "@shared/services/product";
import { getProductDetail } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

const useProductDetail = (id: number) => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["shop", "detail", id, languageCode] as const,
    queryFn: () => getProductDetail({ id, languageCode }),
    select: (res: CommonRes<GetProductDetailRes>): GetProductDetailRes =>
      res.data,
    enabled: Number.isFinite(id),
  });
};

export default useProductDetail;
