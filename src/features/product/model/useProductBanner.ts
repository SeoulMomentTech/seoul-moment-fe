import { useSuspenseQuery } from "@tanstack/react-query";
import { getProductBanner } from "@/shared/services/product";

const useProductBanner = () => {
  return useSuspenseQuery({
    queryKey: ["product", "banner"],
    queryFn: getProductBanner,
    select: (res) => res.data.list,
  });
};

export default useProductBanner;
