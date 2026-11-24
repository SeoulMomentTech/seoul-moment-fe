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
import { toOrderHref } from "@entities/order";
import { Button } from "@seoul-moment/ui";

import { CartBar } from "./CartBar";
import { CartBenefitProgress } from "./CartBenefitProgress";
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
    internationalDiscount,
    nextDiscountThreshold,
    nextDiscountAmount,
    amountToNextDiscount,
    totalProductAmount,
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

  // 주문서는 고른 라인만 다룬다. id 를 URL 로 넘기므로 새로고침·뒤로가기에도 대상이 남는다.
  // 고른 것이 없으면 링크 자체를 만들지 않는다 — 빈 주문서로 보내지 않는다.
  const orderHref = selection.selectedCount
    ? toOrderHref({
        type: "cart",
        cartItemIds: [...selection.selectedCartItemIds],
      })
    : null;

  // 서버 할인액은 장바구니 전체 기준이다. 아무것도 안 골랐으면 빼지 않고, 선택 금액을 넘지 않게 자른다.
  const discount =
    selectedAmount > 0 ? Math.min(internationalDiscount, selectedAmount) : 0;

  const summary = {
    amount: selectedAmount,
    amountToFreeShipping: shipping.amountToFreeShipping,
    discount,
    orderHref,
    remoteIslandFee,
    selectedCount: selection.selectedCount,
    shippingFee: shipping.fee,
    totalAmount: selectedAmount + shipping.fee - discount,
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

        <div className="top-19 sticky grid gap-4 max-lg:static">
          <CartBenefitProgress
            amount={selectedAmount}
            discount={{
              amount: totalProductAmount,
              internationalDiscount,
              nextDiscountThreshold,
              nextDiscountAmount,
              amountToNextDiscount,
            }}
            freeShippingThreshold={freeShippingThreshold}
          />
          <CartSummary {...summary} className="max-sm:hidden" />
        </div>
      </div>

      {/* 모바일에서는 sticky 패널 대신 하단 고정 바 */}
      <FixedBox className="left-0 z-10 hidden max-sm:block" direction="bottom">
        <CartBar {...summary} />
      </FixedBox>
    </>
  );
}
