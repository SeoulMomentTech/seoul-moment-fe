import type { HTTPError } from "ky";

import useAppMutation from "@shared/lib/hooks/query/useAppMutation";

import type { CommonRes } from "@shared/services";
import type { QueryKey } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

interface LikeListRes<TItem> {
  total: number;
  list: TItem[];
}

type Cached<TItem> = CommonRes<LikeListRes<TItem>>;

interface UseOptimisticUnlikeProps<TItem> {
  /** 캐시를 부분 일치로 찾을 키 머리(keys.ts). 필터별로 갈린 캐시를 한 번에 잡는다. */
  rootKey: QueryKey;
  mutationFn(id: number): Promise<unknown>;
  /** 이 줄이 방금 해제된 그것인지. 상품은 productItemId, 브랜드는 brandId 로 가른다. */
  isTarget(item: TItem, id: number): boolean;
}

/**
 * 좋아요 해제. 무효화가 아니라 낙관적 갱신을 쓴다.
 *
 * 무효화만 하면 하트를 눌러도 왕복이 끝날 때까지 줄이 그대로 있다가 갑자기 사라진다.
 * 여기서 목록은 "내가 고른 것들"이고 해제는 그 목록에서 빼는 일 자체여서, 사용자가
 * 방금 한 일이 화면에 바로 보이지 않으면 하트가 고장난 것으로 읽힌다.
 *
 * 그래서 세 가지를 모두 한다 — 누르는 즉시 줄을 빼고(onMutate), 실패하면 찍어 둔
 * 캐시를 그대로 되돌리고(onError), 성공·실패 어느 쪽이든 서버에 다시 묻는다(onSettled).
 * 마지막 하나가 없으면 total 이 우리가 뺀 수만큼만 줄어든 채 남아 다음 화면에서 어긋난다.
 */
export const useOptimisticUnlike = <TItem>({
  rootKey,
  mutationFn,
  isTarget,
}: UseOptimisticUnlikeProps<TItem>) => {
  const queryClient = useQueryClient();

  return useAppMutation<
    unknown,
    HTTPError,
    number,
    { previous: [QueryKey, Cached<TItem> | undefined][] }
  >({
    mutationFn,
    onMutate: async (id) => {
      // 날아가고 있던 요청이 뒤늦게 도착해 방금 뺀 줄을 되살리지 않도록 먼저 멈춘다.
      await queryClient.cancelQueries({ queryKey: rootKey });

      const previous = queryClient.getQueriesData<Cached<TItem>>({
        queryKey: rootKey,
      });

      queryClient.setQueriesData<Cached<TItem>>(
        { queryKey: rootKey },
        (cached) =>
          cached == null
            ? cached
            : {
                ...cached,
                data: {
                  // 다른 필터의 캐시에는 그 줄이 없을 수 있다. 그때는 total 도 건드리지 않는다.
                  total: cached.data.list.some((item) => isTarget(item, id))
                    ? Math.max(0, cached.data.total - 1)
                    : cached.data.total,
                  list: cached.data.list.filter((item) => !isTarget(item, id)),
                },
              },
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, cached]) => {
        queryClient.setQueryData(key, cached);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: rootKey });
    },
  });
};
