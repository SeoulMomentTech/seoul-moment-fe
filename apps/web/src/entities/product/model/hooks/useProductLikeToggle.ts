"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { debounce } from "es-toolkit";

import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";

import { useCreateUserProductLikeMutation } from "../../api/useCreateUserProductLikeMutation";
import { useDeleteUserProductLikeMutation } from "../../api/useDeleteUserProductLikeMutation";

const LIKE_DEBOUNCE_MS = 400;

interface UseProductLikeToggleProps {
  productId: number;
  isLiked: boolean;
  likeCount: number;
}

interface UseProductLikeToggleReturn {
  liked: boolean;
  count: number;
  handleToggleLike(): void;
}

export function useProductLikeToggle({
  productId,
  isLiked,
  likeCount,
}: UseProductLikeToggleProps): UseProductLikeToggleReturn {
  const { isAuthenticated } = useUserAuthStore();

  const [liked, setLiked] = useState(isLiked);
  const [syncedLiked, setSyncedLiked] = useState(isLiked);
  const syncedLikedRef = useRef(isLiked);
  const prevIsLikedRef = useRef(isLiked);

  const { mutate: createLike } = useCreateUserProductLikeMutation();
  const { mutate: deleteLike } = useDeleteUserProductLikeMutation();

  const flushLike = useMemo(
    () =>
      debounce((desired: boolean) => {
        const current = syncedLikedRef.current;
        if (desired === current) return;

        syncedLikedRef.current = desired;
        setSyncedLiked(desired);

        const onError = () => {
          syncedLikedRef.current = current;
          setSyncedLiked(current);
          setLiked(current);
        };

        if (desired) {
          createLike(productId, { onError });
        } else {
          deleteLike(productId, { onError });
        }
      }, LIKE_DEBOUNCE_MS),
    [productId, createLike, deleteLike],
  );

  const handleToggleLike = () => {
    if (!isAuthenticated) return;

    setLiked((prev) => {
      const next = !prev;
      flushLike(next);
      return next;
    });
  };

  useEffect(() => {
    return () => {
      flushLike.flush();
    };
  }, [flushLike]);

  useEffect(
    function syncLikedFromCache() {
      // isLiked가 실제로 변할 때만 재시드 트리거. isLiked가 상수로 고정된
      // 호출자에서 보류 mutation 직후 false-positive 재시드가 일어나지 않도록 보호한다.
      if (prevIsLikedRef.current === isLiked) return;
      prevIsLikedRef.current = isLiked;

      // 보류 중인 mutation이 있으면 사용자의 의도를 덮어쓰지 않는다.
      if (liked !== syncedLiked) return;
      if (syncedLiked === isLiked) return;

      setLiked(isLiked);
      setSyncedLiked(isLiked);
      syncedLikedRef.current = isLiked;
    },
    [isLiked, liked, syncedLiked],
  );

  useEffect(
    function resetLiked() {
      if (!isAuthenticated) {
        setLiked(false);
        setSyncedLiked(false);
        syncedLikedRef.current = false;
      }
    },
    [isAuthenticated],
  );

  const count = Math.max(
    0,
    likeCount + (liked ? 1 : 0) - (syncedLiked ? 1 : 0),
  );

  return { liked, count, handleToggleLike };
}
