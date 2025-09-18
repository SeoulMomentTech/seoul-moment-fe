import { useQuery } from "@tanstack/react-query";
import useLanguage from "@/shared/lib/hooks/useLanguage";
import { getCategories } from "@/shared/services/category";

const useCategories = () => {
  const languageCode = useLanguage();
  return useQuery({
    queryKey: ["about", "categories"],
    queryFn: () => getCategories({ languageCode }),
    select: (res) => {
      return res.data.list;
    },
  });
};

export default useCategories;
