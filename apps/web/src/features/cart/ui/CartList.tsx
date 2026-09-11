"use client";

import { useCallback, useMemo, useRef } from "react";

import { ShoppingCartIcon } from "lucide-react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cn } from "@shared/lib/style";
import { Empty } from "@shared/ui/empty";
import FixedBox from "@shared/ui/fixed-box";

import {
  estimateShipping,
  isCartItemUnavailable,
  listCartItems,
  sumSelectedAmount,
  useCart,
  type UserCartItem,
} from "@entities/cart";
import { Button } from "@seoul-moment/ui";

import { CartBar } from "./CartBar";
import { CartBrandGroupSection } from "./CartBrandGroup";
import { CartEmpty } from "./CartEmpty";
import { CartSelectionBar } from "./CartSelectionBar";
import { CartSummary } from "./CartSummary";
import { useCartSelection } from "../model/useCartSelection";

export function CartList() {
  const t = useTranslations();
  const {
    brandGroups,
    estimatedShippingFee,
    freeShippingThreshold,
    isError,
    refetch,
    remoteIslandFee,
    updateQuantity,
    removeItems,
    restoreItems,
  } = useCart();

  const items = useMemo(() => listCartItems(brandGroups), [brandGroups]);

  // 품절·판매중지 라인은 고를 수 없다. 선택에서 빼야 합계와 개수가 서로 맞는다.
  const unselectableIds = useMemo(
    () =>
      new Set(
        items.filter(isCartItemUnavailable).map((item) => item.cartItemId),
      ),
    [items],
  );

  const selection = useCartSelection(items, unselectableIds);

  // 되돌리기용 스냅샷. 토스트 액션이 실행될 시점에는 목록에서 이미 사라졌으므로 따로 들고 있는다.
  const removedRef = useRef<UserCartItem[]>([]);

  const handleRemove = useCallback(
    (cartItemIds: ReadonlyArray<number>) => {
      if (!cartItemIds.length) return;

      const ids = new Set(cartItemIds);
      removedRef.current = items.filter((item) => ids.has(item.cartItemId));
      removeItems(cartItemIds);

      const snapshot = removedRef.current;
      toast(t("removed_from_cart"), {
        action: {
          label: t("undo"),
          onClick: () => void restoreItems(snapshot),
        },
      });
    },
    [items, removeItems, restoreItems, t],
  );

  const selectedAmount = useMemo(
    () => sumSelectedAmount(items, selection.selectedCartItemIds),
    [items, selection.selectedCartItemIds],
  );

  const shipping = useMemo(
    () =>
      estimateShipping({
        selectedAmount,
        estimatedShippingFee,
        freeShippingThreshold,
      }),
    [selectedAmount, estimatedShippingFee, freeShippingThreshold],
  );

  // 조회 실패를 빈 장바구니로 그리면 담아둔 것이 사라진 것처럼 보인다.
  if (isError && !items.length) {
    return (
      <div className="py-18 grid justify-items-center gap-5 max-sm:py-12">
        <Empty
          description={t("please_try_again")}
          icon={
            <ShoppingCartIcon
              className="size-10 text-black/20"
              strokeWidth={1.6}
            />
          }
        />
        <Button
          className="h-11 rounded-[4px] px-6"
          onClick={() => void refetch()}
          type="button"
          variant="outline"
        >
          {t("try_again")}
        </Button>
      </div>
    );
  }

  if (!items.length) return <CartEmpty />;

  const summary = {
    amount: selectedAmount,
    amountToFreeShipping: shipping.amountToFreeShipping,
    remoteIslandFee,
    selectedCount: selection.selectedCount,
    shippingFee: shipping.fee,
    totalAmount: selectedAmount + shipping.fee,
  };

  return (
    <>
      <CartSelectionBar
        allSelected={selection.allSelected}
        onDeleteAll={() => handleRemove(items.map((item) => item.cartItemId))}
        onDeleteSelected={() =>
          handleRemove([...selection.selectedCartItemIds])
        }
        onToggleAll={selection.toggleAll}
        selectedCount={selection.selectedCount}
        someSelected={selection.someSelected}
        totalCount={selection.selectableCount}
      />

      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_360px] items-start gap-10 pt-1",
          "max-lg:grid-cols-1 max-lg:gap-8",
        )}
      >
        <div>
          {brandGroups.map((group) => (
            <CartBrandGroupSection
              group={group}
              key={group.brandId}
              onQuantityChange={updateQuantity}
              onRemove={(cartItemId) => handleRemove([cartItemId])}
              onToggleGroup={selection.toggleMany}
              onToggleLine={selection.toggle}
              selectedCartItemIds={selection.selectedCartItemIds}
            />
          ))}
        </div>

        <CartSummary {...summary} className="top-19 sticky max-sm:hidden" />
      </div>

      {/* 모바일에서는 sticky 패널 대신 하단 고정 바 */}
      <FixedBox className="left-0 z-10 hidden max-sm:block" direction="bottom">
        <CartBar {...summary} />
      </FixedBox>
    </>
  );
}
