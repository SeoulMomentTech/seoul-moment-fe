import { useEffect, useRef, useState } from "react";

import { useRouter } from "expo-router";

import { USER_PRODUCT_LIKE_KEY } from "@features/my/model/keys";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import type { GetProductDetailRes } from "@shared/services/product";
import {
  deleteUserProductLike,
  postUserProductLike,
} from "@shared/services/userLike";

import type { CommonRes } from "@shared/services";
import { useQueryClient } from "@tanstack/react-query";

/**
 * 연타를 한 번으로 접는 시간. 눌렀다 바로 다시 누르면 원래대로 돌아간 것이므로
 * 서버에 아무것도 보내지 않는다 — 웹의 useProductLikeToggle 과 같은 400ms 다.
 */
const SETTLE_MS = 400;

/**
 * 상품 좋아요. 화면은 누르는 즉시 바뀌고 요청은 뒤따라간다.
 *
 * 장바구니와 반대로 낙관적으로 고친다 — 여기서 움직이는 것은 켜짐·꺼짐과 숫자 하나뿐이고
 * 서버가 계산해 주는 금액이 없다. 하트가 손가락을 따라오지 않으면 눌린 것인지 알 수 없다.
 *
 * 실패하면 눌리기 전으로 되돌린다. 되돌리는 것이 "없던 일"이 되게 하려면 서버에 보낸
 * 마지막 상태(synced)를 따로 들고 있어야 한다 — 화면 상태만으로는 무엇을 되돌릴지 모른다.
 */
export const useProductLikeToggle = ({
  productItemId,
  isLiked,
  likeCount,
}: {
  productItemId: number;
  isLiked: boolean;
  likeCount: number;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);

  const [liked, setLiked] = useState(isLiked);
  const [synced, setSynced] = useState(isLiked);
  const syncedRef = useRef(isLiked);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const like = useAppMutation({ mutationFn: postUserProductLike });
  const unlike = useAppMutation({ mutationFn: deleteUserProductLike });

  // 화면을 떠날 때 기다리던 요청을 흘려보낸다. 그냥 두면 누른 것이 사라진다.
  useEffect(() => () => clearTimeout(timer.current), []);

  const flush = (desired: boolean) => {
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const current = syncedRef.current;
      if (desired === current) return;

      syncedRef.current = desired;
      setSynced(desired);

      const revert = () => {
        syncedRef.current = current;
        setSynced(current);
        setLiked(current);
      };
      /**
       * 상세 캐시는 **다시 읽지 않고 고쳐 쓴다**. 무효화하면 지금 보고 있는 화면이
       * 다시 그려져 방금 누른 하트가 깜빡이고, 그렇다고 그냥 두면 캐시가 옛 값을 든 채
       * 남아 다음에 이 상품을 열 때 빈 하트가 뜬다(실제로 그랬다).
       *
       * 키 뒤에 languageCode 가 붙으므로 앞부분만으로 맞춘다.
       */
      const refresh = () => {
        queryClient.invalidateQueries({ queryKey: USER_PRODUCT_LIKE_KEY });
        queryClient.setQueriesData<CommonRes<GetProductDetailRes>>(
          { queryKey: ["shop", "detail", productItemId] },
          (cached) =>
            cached && {
              ...cached,
              data: {
                ...cached.data,
                isLiked: desired,
                like: Math.max(0, cached.data.like + (desired ? 1 : -1)),
              },
            },
        );
      };

      if (desired) {
        like.mutate(productItemId, { onError: revert, onSuccess: refresh });
      } else {
        unlike.mutate(productItemId, { onError: revert, onSuccess: refresh });
      }
    }, SETTLE_MS);
  };

  const toggle = () => {
    // 좋아요는 계정에 쌓이는 것이라 로그인이 먼저다. 담기 버튼과 같은 길로 보낸다.
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setLiked((prev) => {
      const next = !prev;
      flush(next);
      return next;
    });
  };

  return {
    liked,
    /** 서버가 준 수에 아직 보내지 않은 내 한 표를 더한다. */
    count: Math.max(0, likeCount + (liked ? 1 : 0) - (synced ? 1 : 0)),
    toggle,
  };
};
