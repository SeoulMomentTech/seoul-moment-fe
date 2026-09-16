"use client";

import { useState, type ReactNode } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useMediaQuery } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { GetProductDetailRes } from "@shared/services/product";
import FixedBox from "@shared/ui/fixed-box";

import { useRouter } from "@/i18n/navigation";

import { toOrderHref } from "@entities/order";
import { Button, Drawer, DrawerContent, DrawerTitle } from "@seoul-moment/ui";

import { DraftLineList } from "./DraftLineList";
import { ProductOptionSelects } from "./ProductOptionSelects";
import { ProductVariantSelect } from "./ProductVariantSelect";
import { useAddToCartDraft } from "../model/useAddToCartDraft";

interface AddToCartProps {
  product: GetProductDetailRes;
  /**
   * 좋아요 버튼. 상세 페이지가 이미 `useProductLikeToggle` 을 쓰고 있어서 여기서 다시
   * 호출하면 debounce 상태가 둘로 갈려 서로 덮어쓴다. 그래서 주입받는다.
   */
  likeSlot?: ReactNode;
}

const MOBILE_QUERY = "(max-width: 639px)";

export function AddToCart({ product, likeSlot }: AddToCartProps) {
  const t = useTranslations();
  const router = useRouter();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const draft = useAddToCartDraft({ product });

  const unitPrice =
    product.discountPrice > 0 && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  // 서버 응답을 기다리는 동안 다시 눌리면 같은 조합이 두 번 담긴다.
  const [isSubmitting, setSubmitting] = useState(false);

  /**
   * 구매하기. 장바구니를 거치지 않고 고른 조합을 그대로 주문서로 넘긴다 — 담은 수량과
   * 합산되지 않으므로 "지금 고른 것만" 주문된다.
   */
  const handleBuyNow = () => {
    const items = draft.toDirectItems();

    // 넘길 수 없는 이유는 draft 가 이미 알렸다.
    if (!items) return;

    router.push(toOrderHref({ type: "direct", items }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitting(true);

    try {
      // 서버가 받아준 뒤에만 성공을 알린다. 기다리지 않으면 재고 부족으로 거부된
      // 담기에도 "담았습니다" 가 뜬다.
      if (!(await draft.submit())) return;

      setSheetOpen(false);
      toast.success(t("added_to_cart"), {
        action: {
          label: t("view_cart"),
          onClick: () => router.push("/cart"),
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const options =
    draft.selectMode === "variant" ? (
      <ProductVariantSelect
        choices={draft.variantChoices}
        onPick={draft.pickVariant}
        soldOut={draft.isSoldOut}
      />
    ) : (
      <ProductOptionSelects
        axes={draft.selectableAxes}
        onPick={draft.pickAxis}
        picked={draft.picked}
        unavailableOptionValueIds={draft.unavailableOptionValueIds}
      />
    );

  const soldOutHint = draft.isSoldOut && (
    <p className="text-body-4 text-center font-semibold" role="status">
      {t("product_sold_out")}
    </p>
  );

  /** 하트 · 장바구니 담기 · 구매하기 3버튼 행 */
  const actions = (
    handlers: { onAddToCart(): void; onBuyNow(): void },
    { disabled = false }: { disabled?: boolean } = {},
  ) => (
    <div className="flex items-center gap-2">
      {likeSlot}
      <Button
        className="h-12 flex-1 rounded-[4px] px-5 font-semibold"
        disabled={disabled || draft.isSoldOut}
        onClick={handlers.onAddToCart}
        type="button"
        variant="outline"
      >
        {draft.isSoldOut ? t("sold_out") : t("add_to_cart")}
      </Button>
      <Button
        className="h-12 flex-1 rounded-[4px] px-5 font-semibold"
        disabled={disabled || draft.isSoldOut}
        onClick={handlers.onBuyNow}
        type="button"
      >
        {t("buy_now")}
      </Button>
    </div>
  );

  // ---- 모바일: 하단 고정 바가 시트를 열고, 담기·구매하기는 시트 안에서 확정한다.
  //      vaul Drawer 가 bottom-0 을 덮어 시트가 열린 동안에는 바를 누를 수 없으므로
  //      버튼 행을 시트 안에도 둔다 (디자인의 "시트 아래 버튼 바" 구조와 같은 모습).
  if (isMobile) {
    return (
      <>
        <FixedBox
          className="left-0 z-10 px-5 py-4 drop-shadow-[0_-4px_5px_rgba(0,0,0,0.08)]"
          direction="bottom"
        >
          {actions({
            onAddToCart: () => setSheetOpen(true),
            onBuyNow: () => setSheetOpen(true),
          })}
        </FixedBox>

        <Drawer onOpenChange={setSheetOpen} open={isSheetOpen}>
          <DrawerContent className="px-5 pb-4">
            <DrawerTitle className="sr-only">{t("select_options")}</DrawerTitle>
            <div className="grid gap-4 pt-2.5">
              {options}
              {soldOutHint}
              <DraftLineList
                compact
                lines={draft.lines}
                onQuantityChange={draft.setQuantity}
                onRemove={draft.removeLine}
                removable={draft.canRemoveLines}
                totalAmount={draft.totalAmount}
                unitPrice={unitPrice}
              />
              {!draft.canSubmit && !draft.isSoldOut && (
                <p className="text-body-4 text-neutral text-center">
                  {t("select_option_required")}
                </p>
              )}
              {actions(
                {
                  onAddToCart: () => void handleSubmit(),
                  onBuyNow: handleBuyNow,
                },
                { disabled: !draft.canSubmit || isSubmitting },
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // ---- 데스크톱: 우측 정보 컬럼 안에 인라인
  return (
    <div className={cn("border-t border-black/10 pt-6")}>
      {options}
      {soldOutHint && <div className="mt-4">{soldOutHint}</div>}
      <DraftLineList
        className="mt-5"
        lines={draft.lines}
        onQuantityChange={draft.setQuantity}
        onRemove={draft.removeLine}
        removable={draft.canRemoveLines}
        totalAmount={draft.totalAmount}
        unitPrice={unitPrice}
      />
      <div className="mt-5">
        {actions(
          { onAddToCart: () => void handleSubmit(), onBuyNow: handleBuyNow },
          { disabled: !draft.canSubmit || isSubmitting },
        )}
      </div>
    </div>
  );
}
