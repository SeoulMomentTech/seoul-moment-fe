import { getProductBanner } from "@shared/services/product";

import { useSuspenseQuery } from "@tanstack/react-query";

const useProductBanner = () => {
  return useSuspenseQuery({
    queryKey: ["product", "banner"],
    queryFn: getProductBanner,
    select: (res) => res.data.list,
  });
};

export default useProductBanner;
