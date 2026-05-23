import { useQueryClient } from "@tanstack/react-query";

const useClearAllQueries = () => {
  const queryClient = useQueryClient();

  const clearAllQueries = () => {
    queryClient.removeQueries({ queryKey: ["products"] });
    queryClient.removeQueries({ queryKey: ["product-detail"] });
    queryClient.removeQueries({ queryKey: ["productBrandBanner"] });
    queryClient.removeQueries({ queryKey: ["brandPromotionDetail"] });
  };

  return { clearAllQueries };
};

export default useClearAllQueries;
