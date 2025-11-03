import { useSuspenseQuery } from "@tanstack/react-query";
import useLanguage from "@shared/lib/hooks/useLanguage";
import { getHome } from "@shared/services/home";

const useHome = () => {
  const languageCode = useLanguage();

  return useSuspenseQuery({
    queryKey: ["home", languageCode],
    queryFn: () => getHome({ languageCode }),
    select: (res) => res.data,
  });
};

export default useHome;
