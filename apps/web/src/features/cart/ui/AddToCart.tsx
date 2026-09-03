"use client";

import { useState, type ReactNode } from "react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useMediaQuery } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import type { GetProductDetailRes } from "@shared/services/product";
import FixedBox from "@shared/ui/fixed-box";

import { useRouter } from "@/i18n/navigation";

import { Button, Drawer, DrawerContent, DrawerTitle } from "@seoul-moment/ui";

import { DraftLineList } from "./DraftLineList";
import { ProductOptionSelects } from "./ProductOptionSelects";
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

  const handleSubmit = () => {
    if (!draft.submit()) return;

    setSheetOpen(false);
    toast.success(t("added_to_cart"), {
      action: {
        label: t("view_cart"),
        onClick: () => router.push("/cart"),
      },
    });
  };

  const options = (
    <ProductOptionSelects
      axes={draft.selectableAxes}
      onPick={draft.pickAxis}
      picked={draft.picked}
    />
  );

  const comingSoonHint = (
    <p className="sr-only" id="add-to-cart-coming-soon">
      {t("coming_soon")}
    </p>
  );

  /** 하트 · 장바구니 담기 · 구매하기(비활성) 3버튼 행 */
  const actions = (
    onAddToCart: () => void,
    { addDisabled = false }: { addDisabled?: boolean } = {},
  ) => (
    <div className="flex items-center gap-2">
      {likeSlot}
      <Button
        className="h-12 flex-1 rounded-[4px] px-5 font-semibold"
        disabled={addDisabled}
        onClick={onAddToCart}
        type="button"
        variant="outline"
      >
        {t("add_to_cart")}
      </Button>
      <Button
        aria-describedby="add-to-cart-coming-soon"
        className="h-12 flex-1 rounded-[4px] px-5 font-semibold"
        disabled
        type="button"
      >
        {t("buy_now")}
      </Button>
    </div>
  );

  // ---- 모바일: 하단 고정 바가 시트를 열고, 담기는 시트 안에서 확정한다.
  //      vaul Drawer 가 bottom-0 을 덮어 시트가 열린 동안에는 바를 누를 수 없으므로
  //      3버튼 행을 시트 안에도 둔다 (디자인의 "시트 아래 버튼 바" 구조와 같은 모습).
  if (isMobile) {
    return (
      <>
        <FixedBox
          className="left-0 z-10 px-5 py-4 drop-shadow-[0_-4px_5px_rgba(0,0,0,0.08)]"
          direction="bottom"
        >
          {actions(() => setSheetOpen(true))}
          {comingSoonHint}
        </FixedBox>

        <Drawer onOpenChange={setSheetOpen} open={isSheetOpen}>
          <DrawerContent className="px-5 pb-4">
            <DrawerTitle className="sr-only">{t("select_options")}</DrawerTitle>
            <div className="grid gap-4 pt-2.5">
              {options}
              <DraftLineList
                compact
                lines={draft.lines}
                onQuantityChange={draft.setQuantity}
                onRemove={draft.removeLine}
                removable={draft.mode === "selectable"}
                totalAmount={draft.totalAmount}
                unitPrice={unitPrice}
              />
              {!draft.canSubmit && (
                <p className="text-body-4 text-neutral text-center">
                  {t("select_option_required")}
                </p>
              )}
              {actions(handleSubmit, { addDisabled: !draft.canSubmit })}
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
      <DraftLineList
        className="mt-5"
        lines={draft.lines}
        onQuantityChange={draft.setQuantity}
        onRemove={draft.removeLine}
        removable={draft.mode === "selectable"}
        totalAmount={draft.totalAmount}
        unitPrice={unitPrice}
      />
      <div className="mt-5">
        {actions(handleSubmit, { addDisabled: !draft.canSubmit })}
      </div>
      {comingSoonHint}
    </div>
  );
}
