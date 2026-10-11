import { useState } from "react";

import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { getMaxLineQuantity } from "@entities/cart/lib/cart";
import { isNotEnoughStockError } from "@entities/cart/lib/cartError";
import { useAddToCart } from "@entities/cart/model/useCartMutations";
import type { ProductVariantChoice } from "@entities/product/lib/variantChoices";
import { BottomSheet } from "@shared/ui/bottom-sheet";
import { Button } from "@shared/ui/button";
import { FieldNote } from "@shared/ui/field-note";
import { Touchable } from "@shared/ui/press";
import { QuantityStepper } from "@shared/ui/quantity-stepper";

import { Spacing } from "@/constants/theme";

/** 조합 목록이 길어도 시트가 화면을 다 먹지 않게 한다. 넘치면 목록만 스크롤된다. */
const CHOICE_LIST_MAX_HEIGHT = 260;
/** 남은 개수를 알릴 만큼 적은 재고. 장바구니의 기준(cart.ts)과 같은 값이다. */
const LOW_STOCK = 5;

interface AddToCartSheetProps {
  visible: boolean;
  onClose(): void;
  productName: string;
  choices: ProductVariantChoice[];
}

/**
 * 담기 시트. 조합을 고르고 수량을 정한 뒤 담는다.
 *
 * 담긴 뒤에는 닫지 않고 같은 시트가 확인 화면으로 바뀐다 — 앱에 토스트가 없어서
 * 그냥 닫으면 담긴 것인지 취소된 것인지 알 길이 없다. 거기서 장바구니로 갈지
 * 더 볼지 고른다.
 */
export function AddToCartSheet({
  visible,
  onClose,
  productName,
  choices,
}: AddToCartSheetProps) {
  const router = useRouter();
  const addToCart = useAddToCart();

  // 고를 것이 하나뿐이면 고르는 일이 아니다. 미리 골라 두고 수량만 남긴다.
  const [variantId, setVariantId] = useState<number | undefined>(() =>
    choices.length === 1 && choices[0].isPurchasable
      ? choices[0].variantId
      : undefined,
  );
  const [quantity, setQuantity] = useState(1);

  const selected = choices.find((choice) => choice.variantId === variantId);
  const added = addToCart.isSuccess;

  const select = (choice: ProductVariantChoice) => {
    setVariantId(choice.variantId);
    // 조합이 바뀌면 재고 천장도 바뀐다. 앞 조합의 수량을 들고 가면 새 천장을 넘을 수 있다.
    setQuantity(1);
    if (addToCart.isError) addToCart.reset();
  };

  const submit = () => {
    if (!selected || addToCart.isPending) return;

    addToCart.mutate({
      items: [{ productVariantId: selected.variantId, quantity }],
    });
  };

  return (
    <BottomSheet
      onClose={onClose}
      title={added ? "Added to cart" : "Select an option"}
      visible={visible}
    >
      <View
        className="px-5"
        style={{ paddingBottom: Spacing.section, gap: Spacing.inner }}
      >
        {added ? (
          <Added
            onClose={onClose}
            onViewCart={() => {
              onClose();
              router.push("/cart");
            }}
            summary={`${productName}${selected ? ` · ${selected.label}` : ""} · ${quantity}`}
          />
        ) : (
          <>
            {/* 조합이 하나뿐이어도 그려 둔다 — 무엇을 담는지는 눈으로 확인되어야 한다. */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: CHOICE_LIST_MAX_HEIGHT }}
            >
              <View style={{ gap: 8 }}>
                {choices.map((choice) => (
                  <ChoiceRow
                    choice={choice}
                    key={choice.variantId}
                    onPress={() => select(choice)}
                    selected={choice.variantId === variantId}
                  />
                ))}
              </View>
            </ScrollView>

            <View className="flex-row items-center justify-between">
              <Text className="text-body-2 text-foreground font-bold">
                Quantity
              </Text>
              <QuantityStepper
                disabled={!selected || addToCart.isPending}
                label={productName}
                max={getMaxLineQuantity(selected?.stockQuantity ?? 1)}
                onChange={setQuantity}
                value={quantity}
              />
            </View>

            {addToCart.isError ? (
              <FieldNote error>
                {isNotEnoughStockError(addToCart.error)
                  ? "There isn't enough stock for that quantity."
                  : "We couldn't add this to your cart. Please try again."}
              </FieldNote>
            ) : null}

            <Button
              disabled={!selected || addToCart.isPending}
              label={addToCart.isPending ? "Adding…" : "Add to cart"}
              onPress={submit}
            />
          </>
        )}
      </View>
    </BottomSheet>
  );
}

/** 고를 수 있는 조합 한 줄. 살 수 없는 조합도 지우지 않고 왜 못 고르는지 적는다. */
function ChoiceRow({
  choice,
  selected,
  onPress,
}: {
  choice: ProductVariantChoice;
  selected: boolean;
  onPress(): void;
}) {
  const low = choice.isPurchasable && choice.stockQuantity <= LOW_STOCK;

  return (
    <Touchable
      accessibilityLabel={choice.label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !choice.isPurchasable }}
      className={
        selected
          ? "border-foreground flex-row items-center rounded-lg border px-4 py-3"
          : "border-neutral-subtle flex-row items-center rounded-lg border px-4 py-3"
      }
      disabled={!choice.isPurchasable}
      onPress={onPress}
      style={{ opacity: choice.isPurchasable ? 1 : 0.4 }}
    >
      <Text className="text-body-3 text-foreground flex-1" numberOfLines={2}>
        {choice.label}
      </Text>
      {!choice.isPurchasable ? (
        <Text className="text-body-5 text-neutral ml-3">Sold out</Text>
      ) : low ? (
        <Text className="text-body-5 text-neutral ml-3">
          {`${choice.stockQuantity} left`}
        </Text>
      ) : null}
    </Touchable>
  );
}

/** 담긴 뒤. 여기서 갈 길은 둘뿐이라 둘만 둔다. */
function Added({
  summary,
  onViewCart,
  onClose,
}: {
  summary: string;
  onViewCart(): void;
  onClose(): void;
}) {
  return (
    <>
      <Text className="text-body-3 text-neutral" numberOfLines={2}>
        {summary}
      </Text>
      <View style={{ gap: Spacing.tight }}>
        <Button label="View cart" onPress={onViewCart} />
        <Button label="Keep shopping" onPress={onClose} variant="secondary" />
      </View>
    </>
  );
}
