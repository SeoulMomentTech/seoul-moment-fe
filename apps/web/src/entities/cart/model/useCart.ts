"use client";

import { useCallback, useMemo, useRef } from "react";

import { debounce } from "es-toolkit";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { AddCartLinesOutcome, CartLine, CartLineDraft } from "./types";
import { useCartStore } from "./useCartStore";
import {
  useCreateUserCartItemMutation,
  useDeleteUserCartItemsMutation,
  useFetchUserCart,
  useUpdateUserCartItemMutation,
} from "../api/useUserCart";
import { isNotEnoughStockError } from "../lib/cartError";
import { createCartLineId } from "../lib/cartLineId";

/**
 * 수량 스테퍼는 클릭마다 부른다. 클릭당 PATCH 를 보내지 않고 이만큼 모았다가 한 번에 보낸다.
 */
const QUANTITY_SYNC_DELAY = 400;

/**
 * 재고 부족 토스트는 하나로 합친다. 여러 라인을 한 번에 흘리면 그만큼 409 가 오고,
 * sonner 는 같은 id 를 갱신하므로 화면이 토스트로 덮이지 않는다.
 */
const STOCK_TOAST_ID = "cart-stock";

/**
 * 장바구니에 접근하는 **유일한 경계**.
 *
 * UI 컴포넌트는 `useCartStore` 를 직접 import 하지 않는다. 화면이 읽는 값은 아직 로컬이지만,
 * 쓰기는 여기서 서버에도 같이 흘린다(write-through) — 그래야 헤더 배지가 읽는
 * `GET user/cart/count` 가 화면과 어긋나지 않는다.
 *
 * 서버 쓰기는 **best-effort** 다. 화면상 조작은 로컬에서 이미 끝났으므로 실패해도 되돌리지
 * 않고 Sentry 로만 남긴다. 서버 id 를 아직(또는 끝내) 못 받은 라인은 서버에 반영하지 않는다.
 */
export const useCart = () => {
  const t = useTranslations();
  const lines = useCartStore((state) => state.lines);
  const isHydrated = useCartStore((state) => state.hasHydrated);

  const addLinesLocal = useCartStore((state) => state.addLines);
  const updateQuantityLocal = useCartStore((state) => state.updateQuantity);
  const removeLinesLocal = useCartStore((state) => state.removeLines);
  const restoreLinesLocal = useCartStore((state) => state.restoreLines);
  const clear = useCartStore((state) => state.clear);
  const attachCartItemId = useCartStore((state) => state.attachCartItemId);

  const { mutateAsync: createItem } = useCreateUserCartItemMutation({
    toastOnError: false,
  });
  // `mutate` 의 호출별 콜백은 관찰자 하나를 공유해 나중 호출이 앞 호출을 덮는다.
  // 라인마다 409 를 따로 처리해야 하므로 promise 로 받는다(`createItem` 과 같은 이유).
  const { mutateAsync: updateItem } = useUpdateUserCartItemMutation({
    toastOnError: false,
  });
  const { mutate: deleteItems } = useDeleteUserCartItemsMutation({
    toastOnError: false,
  });

  const fetchUserCart = useFetchUserCart();

  /**
   * 409(재고 부족)를 받은 라인을 서버 상태로 정정한다.
   *
   * 되돌릴 이전 값을 들고 다니지 않는다 — 409 는 "그 수량은 존재할 수 없다"는 확정
   * 답변이고, 그 순간 옳은 수량을 아는 쪽은 서버다. 남은 재고도 어차피 다시 읽어야
   * 스테퍼 상한이 맞으므로 한 번의 재조회로 둘 다 해결한다.
   *
   * 실패한 라인만 건드린다. 전역 effect 로 맞추면 다른 라인의 낙관적 업데이트와 경합한다.
   */
  const reconcileAfterStockConflict = useCallback(
    async (lineId: string) => {
      const res = await fetchUserCart().catch(() => null);

      // 서버를 못 읽었으면 무엇이 옳은지 모른다. 로컬은 그대로 두고 알리기만 한다.
      if (!res) {
        toast.error(t("stock_not_enough"), { id: STOCK_TOAST_ID });
        return;
      }

      const line = useCartStore
        .getState()
        .lines.find((item) => item.lineId === lineId);
      const serverItem = res.data.brandGroups
        .flatMap((group) => group.items)
        .find((item) => item.cartItemId === line?.cartItemId);

      // 서버에 짝이 없다 = 담기 자체가 거부됐다. 로컬에만 남기면 영구히 어긋난다.
      if (!serverItem) {
        removeLinesLocal([lineId]);
        toast.error(t("stock_not_enough"), { id: STOCK_TOAST_ID });
        return;
      }

      updateQuantityLocal(lineId, serverItem.quantity);
      toast.error(t("stock_left_only", { stock: serverItem.stockQuantity }), {
        id: STOCK_TOAST_ID,
      });
    },
    [fetchUserCart, removeLinesLocal, updateQuantityLocal, t],
  );

  /**
   * 로컬에 생긴 라인을 서버에도 담고, 돌아온 서버 id 를 그 라인에 붙인다.
   *
   * 결과를 돌려준다 — 담기 성공 토스트는 서버가 받아준 뒤에만 떠야 한다.
   * 던지지는 않는다. 재고 부족 외의 실패는 best-effort 로 흘려보내기 때문이다.
   */
  const pushToServer = useCallback(
    async (
      line: Pick<CartLine, "lineId" | "productVariantId" | "quantity">,
    ): Promise<"ok" | "stock" | "skipped"> => {
      if (!line.productVariantId) return "skipped";

      try {
        // 한 번에 여러 라인을 담는다. `mutate` 의 호출별 콜백은 관찰자 하나를 공유해서
        // 나중 호출이 앞 호출의 콜백을 덮어쓰므로, 라인별 응답은 promise 로 받는다.
        const res = await createItem({
          productVariantId: line.productVariantId,
          quantity: line.quantity,
        });

        attachCartItemId(line.lineId, res.data.cartItemId);
        return "ok";
      } catch (error) {
        // 재고 부족만 되돌린다. 나머지 실패는 로컬을 유지하고, 보고는
        // `meta` 를 보는 MutationCache 가 한다.
        if (!isNotEnoughStockError(error)) return "skipped";

        await reconcileAfterStockConflict(line.lineId);
        return "stock";
      }
    },
    [createItem, attachCartItemId, reconcileAfterStockConflict],
  );

  /**
   * 로컬에 먼저 담고 서버 응답까지 기다린다.
   *
   * 로컬 반영은 즉시라 화면(배지·목록)은 바로 움직이지만, **결과는 서버가 확정한다** —
   * 기다리지 않으면 재고 부족으로 거부된 담기에도 "담았습니다" 가 뜬다.
   */
  const addLines = useCallback(
    async (
      drafts: ReadonlyArray<CartLineDraft>,
    ): Promise<AddCartLinesOutcome> => {
      const result = addLinesLocal(drafts);

      // 상한에 걸리면 로컬에도 아무것도 안 들어갔다. 서버에도 보내지 않는다.
      if (result.status !== "added") return result;

      const outcomes = await Promise.all(
        drafts.map((draft) =>
          pushToServer({
            lineId: createCartLineId(draft.productId, draft.options),
            productVariantId: draft.productVariantId,
            quantity: draft.quantity,
          }),
        ),
      );

      // 한 줄이라도 재고에 막혔으면 담기를 성공으로 알리지 않는다.
      if (outcomes.includes("stock")) return { status: "stock" };

      return result;
    },
    [addLinesLocal, pushToServer],
  );

  // 라인별 최신 수량만 남겼다가 한 번에 흘린다. 타이머 하나로 여러 라인을 함께 보낸다 —
  // 라인마다 debounce 를 두면 옆 라인을 건드릴 때 앞 라인의 변경이 밀린다.
  const pendingQuantities = useRef(
    new Map<string, { cartItemId: number; quantity: number }>(),
  );

  const flushQuantities = useMemo(
    () =>
      debounce(() => {
        const pending = [...pendingQuantities.current.entries()];
        pendingQuantities.current.clear();

        pending.forEach(([lineId, { cartItemId, quantity }]) => {
          updateItem({ cartItemId, quantity }).catch((error: unknown) => {
            if (isNotEnoughStockError(error)) {
              void reconcileAfterStockConflict(lineId);
            }
          });
        });
      }, QUANTITY_SYNC_DELAY),
    [updateItem, reconcileAfterStockConflict],
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      updateQuantityLocal(lineId, quantity);

      // 스토어가 상한으로 깎았을 수 있으므로 반영된 값을 다시 읽는다.
      const line = useCartStore
        .getState()
        .lines.find((item) => item.lineId === lineId);

      if (!line?.cartItemId) return;

      pendingQuantities.current.set(lineId, {
        cartItemId: line.cartItemId,
        quantity: line.quantity,
      });
      flushQuantities();
    },
    [updateQuantityLocal, flushQuantities],
  );

  const removeLines = useCallback(
    (lineIds: ReadonlyArray<string>) => {
      const targets = new Set(lineIds);
      const cartItemIds = useCartStore
        .getState()
        .lines.filter((line) => targets.has(line.lineId))
        .map((line) => line.cartItemId)
        .filter((cartItemId): cartItemId is number => cartItemId != null);

      removeLinesLocal(lineIds);

      // `deleteUserCartItems()` 를 빈 인자로 부르면 **전체 비우기**다. 지울 서버 라인이
      // 없으면 호출 자체를 하지 않는다.
      if (cartItemIds.length) deleteItems(cartItemIds);
    },
    [removeLinesLocal, deleteItems],
  );

  const restoreLines = useCallback(
    (restored: ReadonlyArray<CartLine>) => {
      // 이미 살아 있는 라인은 스토어도 건너뛴다. 그대로 서버에 보내면 수량이 두 번 더해진다.
      const existing = new Set(
        useCartStore.getState().lines.map((line) => line.lineId),
      );
      const additions = restored.filter((line) => !existing.has(line.lineId));

      restoreLinesLocal(additions);

      // 서버에서는 이미 지워졌다. 되돌리기는 곧 다시 담기이고, 새 `cartItemId` 를 받는다.
      // 되돌리기는 토스트 액션이라 기다릴 호출부가 없다.
      additions.forEach((line) => void pushToServer(line));
    },
    [restoreLinesLocal, pushToServer],
  );

  return {
    lines,
    isHydrated,
    /** 헤더 배지에 쓰는 값 — 라인 개수(수량 합이 아니다) */
    lineCount: lines.length,
    addLines,
    updateQuantity,
    removeLines,
    restoreLines,
    /**
     * 로컬만 비운다. 계정 전환 시 이전 사용자의 흔적을 지우는 용도라
     * (`useCartOwnerGuard`) 남의 서버 장바구니를 지우면 안 된다.
     */
    clear,
  };
};
