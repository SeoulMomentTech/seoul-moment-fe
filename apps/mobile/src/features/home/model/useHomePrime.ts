import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import type { LanguageType } from "@shared/lib/i18n/language";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type {
  GetHomeRes,
  HomeBanner,
  HomePromotion,
} from "@shared/services/home";
import { getHome } from "@shared/services/home";

// CommonRes 는 서비스 배럴(index.ts)에만 있다. home.ts 는 그것을 import 할 뿐
// re-export 하지 않으므로 "@shared/services/home" 에서 가져오면 컴파일되지 않는다.
import type { CommonRes } from "@shared/services";

// 배너와 프로모션은 같은 home/v1 응답에서 나온다. 키가 같으면 react-query 가
// 캐시를 공유하므로 두 훅을 같이 써도 네트워크 요청은 한 번이다.
const primeKey = (language: LanguageType) =>
  ["home", "prime", language] as const;

export const useHomeBanner = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: primeKey(languageCode),
    queryFn: () => getHome({ languageCode }),
    select: (res: CommonRes<GetHomeRes>): HomeBanner | undefined =>
      res.data.banner[0],
  });
};

export const useHomePromotion = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: primeKey(languageCode),
    queryFn: () => getHome({ languageCode }),
    select: (res: CommonRes<GetHomeRes>): HomePromotion[] =>
      res.data.promotion ?? [],
  });
};
