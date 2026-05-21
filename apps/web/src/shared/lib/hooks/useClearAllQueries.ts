import { useQueryClient } from "@tanstack/react-query";

const useClearAllQueries = () => {
  const queryClient = useQueryClient();

  const clearAllQueries = () => {
    queryClient.removeQueries({ queryKey: ["products"] });
    queryClient.removeQueries({ queryKey: ["product-detail"] });
  };

  return { clearAllQueries };
};

export default useClearAllQueries;
