"use client";

import { useCallback, useMemo, useRef } from "react";

import { debounce } from "es-toolkit";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { readErrorInfo } from "@shared/lib/utils/error";

import { clampLineQuantity } from "./cartPolicy";
import type {
  AddCartItemsOutcome,
  CartItemDraft,
  UserCartBrandGroup,
  UserCartItem,
} from "./types";
import {
  useCreateUserCartItemMutation,
  useDeleteUserCartItemsMutation,
  useFetchUserCart,
  useSetCartItemQuantity,
  useUpdateUserCartItemMutation,
  useUserCartQuery,
} from "../api/useUserCart";
import { isNotEnoughStockError } from "../lib/cartError";

/**
 * 수량 스테퍼는 클릭마다 부른다. 클릭당 PATCH 를 보내지 않고 이만큼 모았다가 한 번에 보낸다.
 */
const QUANTITY_SYNC_DELAY = 400;

/**
 * 재고 부족 토스트는 하나로 합친다. 여러 라인을 한 번에 흘리면 그만큼 409 가 오고,
 * sonner 는 같은 id 를 갱신하므로 화면이 토스트로 덮이지 않는다.
 */
const STOCK_TOAST_ID = "cart-stock";

/** 캐시가 비었을 때 매번 새 배열을 만들지 않도록 고정 참조를 쓴다 */
const EMPTY_BRAND_GROUPS: UserCartBrandGroup[] = [];

/**
 * 장바구니에 접근하는 **유일한 경계**.
 *
 * 읽기도 쓰기도 서버(`user/cart`)다. 화면이 그리는 값은 쿼리 캐시이고, 낙관적 반영은
 * 그 캐시를 직접 고쳐서 한다 — 로컬 사본을 따로 두면 두 세계를 동기화해야 하고 결국
 * 어느 쪽이 옳은지 알 수 없어진다.
 *
 * 실패했을 때 되돌릴 값도 서버에서 다시 읽는다. 옳은 수량과 남은 재고를 아는 쪽은 서버다.
 */
export const useCart = () => {
  const t = useTranslations();

  const { data, isPending, isError, refetch } = useUserCartQuery();

  const setItemQuantity = useSetCartItemQuantity();
  const fetchUserCart = useFetchUserCart();

  // 라인마다 결과를 따로 처리해야 하므로 promise 로 받는다 — `mutate` 의 호출별 콜백은
  // 관찰자 하나를 공유해 나중 호출이 앞 호출의 콜백을 덮어쓴다.
  const { mutateAsync: createItem } = useCreateUserCartItemMutation({
    toastOnError: false,
  });
  const { mutateAsync: updateItem } = useUpdateUserCartItemMutation({
    toastOnError: false,
  });
  const { mutate: deleteItems } = useDeleteUserCartItemsMutation();

  /**
   * 재고 부족이 아닌 실패를 알린다.
   *
   * 서버 장바구니가 유일한 저장소가 된 뒤로 실패는 곧 "아무 일도 일어나지 않았다"는 뜻이라
   * 조용히 넘길 수 없다. 재고 부족은 전용 문구가 따로 있어 이 경로를 타지 않는다.
   */
  const notifyFailure = useCallback(
    (error: unknown) => {
      void readErrorInfo(error).then((info) =>
        toast.error(info.message ?? t("please_try_again")),
      );
    },
    [t],
  );

  /**
   * 409(재고 부족)를 받은 뒤 서버 상태로 정정한다.
   *
   * 되돌릴 이전 값을 들고 다니지 않는다 — 409 는 "그 수량은 존재할 수 없다"는 확정
   * 답변이고, 그 순간 옳은 수량을 아는 쪽은 서버다. 남은 재고도 어차피 다시 읽어야
   * 스테퍼 상한이 맞으므로 한 번의 재조회로 둘 다 해결한다.
   */
  const reconcileAfterStockConflict = useCallback(
    async (cartItemId?: number) => {
      const res = await fetchUserCart().catch(() => null);

      const serverItem =
        cartItemId == null
          ? undefined
          : res?.data.brandGroups
              .flatMap((group) => group.items)
              .find((item) => item.cartItemId === cartItemId);

      // 서버를 못 읽었거나 그 라인이 사라졌으면 남은 재고를 말할 수 없다.
      if (!serverItem) {
        toast.error(t("stock_not_enough"), { id: STOCK_TOAST_ID });
        return;
      }

      toast.error(t("stock_left_only", { stock: serverItem.stockQuantity }), {
        id: STOCK_TOAST_ID,
      });
    },
    [fetchUserCart, t],
  );

  /**
   * 고른 조합들을 서버 장바구니에 담는다.
   *
   * SKU 를 못 정한 라인이 하나라도 있으면 아무것도 담지 않는다 — 일부만 담기면 사용자는
   * 무엇이 빠졌는지 알 수 없고, 남은 라인을 다시 고르는 것 말고는 할 일이 없다.
   */
  const addItems = useCallback(
    async (
      drafts: ReadonlyArray<CartItemDraft>,
    ): Promise<AddCartItemsOutcome> => {
      if (!drafts.length) return { status: "added" };

      const targets = drafts.filter(
        (draft): draft is CartItemDraft & { productVariantId: number } =>
          draft.productVariantId != null,
      );

      if (targets.length !== drafts.length) return { status: "invalid" };

      const outcomes = await Promise.all(
        targets.map(async (draft) => {
          try {
            await createItem({
              productVariantId: draft.productVariantId,
              quantity: draft.quantity,
            });
            return "ok" as const;
          } catch (error) {
            if (isNotEnoughStockError(error)) return "stock" as const;

            notifyFailure(error);
            return "error" as const;
          }
        }),
      );

      // 담기의 409 는 어떤 라인이 막혔는지 서버 id 로 짚을 수 없다(아직 id 가 없다).
      // 목록을 다시 읽어 화면을 맞추는 것으로 충분하다.
      if (outcomes.includes("stock")) {
        await reconcileAfterStockConflict();
        return { status: "stock" };
      }

      if (outcomes.includes("error")) return { status: "error" };

      return { status: "added" };
    },
    [createItem, notifyFailure, reconcileAfterStockConflict],
  );

  // 라인별 최신 수량만 남겼다가 한 번에 흘린다. 타이머 하나로 여러 라인을 함께 보낸다 —
  // 라인마다 debounce 를 두면 옆 라인을 건드릴 때 앞 라인의 변경이 밀린다.
  const pendingQuantities = useRef(new Map<number, number>());

  const flushQuantities = useMemo(
    () =>
      debounce(() => {
        const pending = [...pendingQuantities.current.entries()];
        pendingQuantities.current.clear();

        pending.forEach(([cartItemId, quantity]) => {
          updateItem({ cartItemId, quantity }).catch((error: unknown) => {
            if (isNotEnoughStockError(error)) {
              void reconcileAfterStockConflict(cartItemId);
              return;
            }

            notifyFailure(error);
          });
        });
      }, QUANTITY_SYNC_DELAY),
    [updateItem, reconcileAfterStockConflict, notifyFailure],
  );

  const updateQuantity = useCallback(
    (cartItemId: number, quantity: number) => {
      const next = clampLineQuantity(quantity);

      // 화면은 지금 바꾸고 전송만 모은다. 스테퍼가 굳어 보이면 안 된다.
      setItemQuantity(cartItemId, next);
      pendingQuantities.current.set(cartItemId, next);
      flushQuantities();
    },
    [setItemQuantity, flushQuantities],
  );

  const removeItems = useCallback(
    (cartItemIds: ReadonlyArray<number>) => {
      // `deleteUserCartItems()` 를 빈 인자로 부르면 **전체 비우기**다. 지울 것이 없으면
      // 호출 자체를 하지 않는다.
      if (!cartItemIds.length) return;

      deleteItems([...cartItemIds]);
    },
    [deleteItems],
  );

  /**
   * 삭제 되돌리기. 서버에서는 이미 지워졌으므로 되돌리기는 곧 다시 담기이고, 새 `cartItemId`
   * 를 받는다. 같은 SKU 를 서버가 수량 합산하므로 이중 담기를 따로 막지 않아도 된다.
   */
  const restoreItems = useCallback(
    (items: ReadonlyArray<UserCartItem>) =>
      addItems(
        items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      ),
    [addItems],
  );

  return {
    brandGroups: data?.brandGroups ?? EMPTY_BRAND_GROUPS,
    /** 구매 가능 라인의 상품 금액 합. 선택과 무관한 **장바구니 전체** 기준이다 */
    totalProductAmount: data?.totalProductAmount ?? 0,
    /** 배송지가 아직 없으므로 본섬 기준 예상값. 확정은 주문서에서 한다 */
    estimatedShippingFee: data?.estimatedShippingFee ?? 0,
    remoteIslandFee: data?.remoteIslandFee ?? 0,
    freeShippingThreshold: data?.freeShippingThreshold ?? 0,
    /** 라인 개수(수량 합이 아니다) */
    totalCount: data?.totalCount ?? 0,
    isPending,
    isError,
    /** 첫 조회가 실패했을 때 화면이 다시 시도할 수단 */
    refetch,
    addItems,
    updateQuantity,
    removeItems,
    restoreItems,
  };
};
