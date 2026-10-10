import type { ReactNode } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatPrice,
  getCartItemUnitPrice,
  getMaxLineQuantity,
  isCartItemLowStock,
  isCartItemUnavailable,
} from "@entities/cart/lib/cart";
import { isNotEnoughStockError } from "@entities/cart/lib/cartError";
import {
  useRemoveCartItem,
  useUpdateCartItemQuantity,
} from "@entities/cart/model/useCartMutations";
import { useUserCart } from "@entities/cart/model/useUserCart";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import type {
  GetUserCartRes,
  UserCartBrandGroup,
  UserCartItem,
} from "@shared/services/userCart";
import { Button } from "@shared/ui/button";
import { CartIcon, CloseIcon, EMPTY_ICON_SIZE } from "@shared/ui/icons";
import { Touchable } from "@shared/ui/press";
import { QuantityStepper } from "@shared/ui/quantity-stepper";
import { ScreenHeader } from "@shared/ui/screen-header";
import { Section } from "@shared/ui/section";
import { EmptyState, ScreenError } from "@shared/ui/section-state";
import {
  CART_BRAND_AVATAR_SIZE,
  CART_META_HEIGHT,
  CART_ROW_HEIGHT,
  CART_THUMB_SIZE,
  CartSkeleton,
  LINE_BODY_2,
  LINE_BODY_5,
} from "@shared/ui/skeleton";

import { Spacing } from "@/constants/theme";

// SVG 는 className 을 못 받아 토큰 값을 직접 넘긴다.
const EMPTY_ICON_COLOR = "#707070"; // --neutral-600
const REMOVE_ICON_COLOR = "#707070"; // --neutral-600
const REMOVE_ICON_SIZE = 18;
// 지우기 단추의 터치 상자. 글리프는 18 이지만 상자는 44 여야 손가락에 맞는다.
const REMOVE_TOUCH = 44;
// 왕복 중인 줄. 공용 Button 의 비활성(0.3)보다 옅게 흐리는 이유는, 이 줄은 못 쓰는 줄이
// 아니라 "지금 서버에 묻고 있는 줄"이라서다 — 적힌 값은 여전히 읽을 수 있어야 한다.
const BUSY_OPACITY = 0.5;
// 금액 줄의 높이. 긴 라벨이 두 줄로 접히는 기기(SE)에서도 세 줄의 높이가 같아야
// 숫자들이 한 열로 읽힌다.
const SUMMARY_ROW_HEIGHT = 2 * LINE_BODY_2;

/**
 * 장바구니. 로그인한 사람의 장바구니만 다룬다 — 게스트 장바구니는 이 앱에 없다.
 *
 * 앱에는 담는 자리가 없다(상품 상세는 읽기 전용). 여기 있는 줄은 같은 계정으로 web 에서
 * 담은 것들이고, 이 화면이 할 수 있는 일은 보기 · 수량 바꾸기 · 지우기 셋뿐이다.
 *
 * 가드 순서는 앱의 다른 화면과 같다 — 로그아웃 → 오프라인 → 로딩 → 실패 → 빈 목록 → 그리기.
 * 로그아웃을 맨 앞에 두는 이유는 그때 쿼리가 꺼져 있어 isPending 이 영원히 유지되기 때문이다.
 */
export function CartScreen() {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const cart = useUserCart();

  if (!isAuthenticated) {
    return (
      <CartShell>
        <CartTitle />
        <SignedOut />
      </CartShell>
    );
  }

  // 오프라인이면 요청이 paused 된 채 isPending 이 유지된다.
  if (cart.isPending && cart.fetchStatus === "paused") {
    return (
      <CartShell>
        <CartTitle />
        <View className="flex-1">
          <ScreenError offline onRetry={() => void cart.refetch()} />
        </View>
      </CartShell>
    );
  }

  if (cart.isPending) {
    return (
      <CartShell>
        <CartTitle />
        <CartSkeleton />
      </CartShell>
    );
  }

  // 조회 실패를 빈 장바구니로 그리면 담아 둔 것이 사라진 것처럼 보인다.
  if (cart.isError) {
    return (
      <CartShell>
        <CartTitle />
        <View className="flex-1">
          <ScreenError onRetry={() => void cart.refetch()} />
        </View>
      </CartShell>
    );
  }

  if (cart.data.brandGroups.length === 0) {
    return (
      <CartShell>
        <CartTitle count={cart.data.totalCount} />
        <View className="flex-1 justify-center">
          <EmptyState
            hint="Items you add in the web shop show up here."
            icon={<CartIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />}
            message="Your cart is empty"
          />
        </View>
      </CartShell>
    );
  }

  return (
    <CartShell>
      <CartBody cart={cart.data} />
    </CartShell>
  );
}

/** 사진 없는 화면의 틀. 계정 화면들(AccountShell)과 같은 머리를 쓴다. */
function CartShell({ children }: { children: ReactNode }) {
  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <ScreenHeader />
      {children}
    </View>
  );
}

/**
 * 화면 제목과 줄 수. 머리(ScreenHeader)에는 제목을 적지 않는다 — 같은 말이 12pt 떨어져
 * 두 번 적히면 둘 중 어느 것이 제목인지 알 수 없다.
 *
 * 개수 자리는 숫자를 모를 때도 비워 둔 채 남는다. 도착할 때마다 아래가 18pt 밀려 내려오면
 * 화면이 한 번 더 움직인다.
 */
function CartTitle({ count }: { count?: number }) {
  return (
    <View className="px-5" style={{ paddingTop: Spacing.inner }}>
      <Text className="text-title-3 text-foreground font-bold">Cart</Text>
      <View className="mt-1" style={{ height: LINE_BODY_5 }}>
        {count == null ? null : (
          <Text className="text-body-5 text-neutral">
            {count === 1 ? "1 item" : `${count} items`}
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * 로그아웃. 맞춤 정보 화면(PreferencesScreen)과 같은 거절이지만 한 걸음을 더 준다 —
 * 거기는 마이 탭 안이라 로그인 버튼이 바로 옆에 있지만, 장바구니는 헤더에서 바로 오므로
 * 여기서 길을 알려 주지 않으면 되돌아 나가 탭을 찾아야 한다.
 */
function SignedOut() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center">
      <EmptyState
        hint="Your cart is saved to your account."
        icon={<CartIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />}
        message="You're signed out"
      />
      <View className="px-5">
        <Button label="Sign in" onPress={() => router.push("/login")} />
      </View>
    </View>
  );
}

/** 실패를 알리는 한 가지 자리. 재고 부족만 문구가 다르다 — 다시 눌러도 같은 답이 온다. */
const warnCartFailure = (error: unknown) => {
  if (isNotEnoughStockError(error)) {
    Alert.alert("Not enough stock", "We've refreshed what's left in stock.");
    return;
  }

  Alert.alert("Couldn't update your cart", "Please try again in a moment.");
};

function CartBody({ cart }: { cart: GetUserCartRes }) {
  const insets = useSafeAreaInsets();
  const update = useUpdateCartItemQuantity();
  const remove = useRemoveCartItem();

  // 지금 서버에 묻고 있는 줄. 그 줄만 잠근다 — 금액은 아직 옛 값이므로, 수량만 먼저
  // 바뀌어 보이면 한 화면 안에서 숫자끼리 어긋난다. 두 mutation 모두 재조회가 끝날 때까지
  // pending 을 유지하므로(useCartMutations) 금액이 도착하고 나서야 잠금이 풀린다.
  const busyCartItemId = update.isPending
    ? update.variables.cartItemId
    : remove.isPending
      ? remove.variables
      : undefined;

  const changeQuantity = (item: UserCartItem, quantity: number) =>
    update.mutate(
      { cartItemId: item.cartItemId, quantity },
      {
        onError: warnCartFailure,
      },
    );

  /**
   * 지우기는 한 번 묻고 지운다. 앱에는 담는 자리가 없어 되돌릴 방법이 없다 —
   * 관심 목록의 하트처럼 "다시 누르면 돌아온다"가 성립하지 않는다.
   */
  const confirmRemove = (item: UserCartItem) =>
    Alert.alert(
      "Remove from cart",
      `${item.productName} will be removed. You can't add it back from the app.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            remove.mutate(item.cartItemId, { onError: warnCartFailure }),
        },
      ],
    );

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.section }}
      showsVerticalScrollIndicator={false}
    >
      <CartTitle count={cart.totalCount} />
      {cart.brandGroups.map((group) => (
        <Section key={group.brandId} title={<BrandHeading group={group} />}>
          {group.items.map((item) => (
            <CartRow
              busy={busyCartItemId === item.cartItemId}
              item={item}
              key={item.cartItemId}
              onChangeQuantity={(quantity) => changeQuantity(item, quantity)}
              onRemove={() => confirmRemove(item)}
            />
          ))}
        </Section>
      ))}
      <CartSummary cart={cart} />
    </ScrollView>
  );
}

/**
 * 브랜드 묶음의 머리. 이 묶음의 상품 금액 합(productAmount)은 적지 않는다 —
 * 묶음은 표시용일 뿐이고 배송비는 브랜드와 무관하게 주문 1건당 1회인데, 브랜드마다
 * 합계가 적혀 있으면 브랜드별로 따로 계산되는 주문처럼 읽힌다. 금액은 화면 끝 요약 한 곳에서만 말한다.
 */
function BrandHeading({ group }: { group: UserCartBrandGroup }) {
  const router = useRouter();

  return (
    <Touchable
      accessibilityLabel={`View ${group.brandName}`}
      accessibilityRole="button"
      className="flex-row items-center"
      // 24pt 한 줄이라 10 으로 넓혀 44pt 터치 영역을 맞춘다.
      hitSlop={10}
      onPress={() => router.push(`/brand/${group.brandId}`)}
      style={{ height: CART_BRAND_AVATAR_SIZE }}
    >
      <Image
        contentFit="cover"
        source={group.brandProfileImage}
        style={{
          width: CART_BRAND_AVATAR_SIZE,
          height: CART_BRAND_AVATAR_SIZE,
          borderRadius: CART_BRAND_AVATAR_SIZE / 2,
        }}
        transition={200}
      />
      <Text
        className="text-title-4 text-foreground ml-2 flex-1 font-bold"
        numberOfLines={1}
      >
        {group.brandName}
      </Text>
    </Touchable>
  );
}

/**
 * 장바구니 한 줄. 사진 · 이름 · 옵션 · 상태 · 가격 · 수량, 그리고 오른쪽 위의 지우기.
 *
 * 품절이거나 판매가 멈춘 줄도 지울 수는 있다 — 그것 말고 할 수 있는 일이 없는 줄이다.
 * 잠기는 것은 수량 스테퍼뿐이다.
 */
function CartRow({
  item,
  busy,
  onChangeQuantity,
  onRemove,
}: {
  item: UserCartItem;
  /** 이 줄이 서버에 묻는 중. 수량과 사진 링크가 잠기고 줄 전체가 흐려진다. */
  busy: boolean;
  onChangeQuantity(quantity: number): void;
  onRemove(): void;
}) {
  const router = useRouter();

  const unavailable = isCartItemUnavailable(item);
  const unitPrice = getCartItemUnitPrice(item);
  const hasDiscount = unitPrice < item.price;

  const openProduct = () => router.push(`/product/${item.productItemId}`);

  return (
    <View
      className="flex-row px-5"
      style={{
        height: CART_ROW_HEIGHT,
        paddingVertical: 12,
        opacity: busy ? BUSY_OPACITY : 1,
      }}
    >
      <Touchable
        accessibilityLabel={item.productName}
        accessibilityRole="button"
        disabled={busy}
        feedback="card"
        onPress={openProduct}
      >
        <Image
          contentFit="cover"
          source={item.imageUrl}
          // 사진이 404 이거나 느려도 줄 높이가 흔들리지 않게 크기를 못 박는다.
          style={{
            width: CART_THUMB_SIZE,
            height: CART_THUMB_SIZE,
            borderRadius: 8,
          }}
          transition={200}
        />
      </Touchable>

      <View className="flex-1" style={{ marginLeft: Spacing.tight }}>
        <Touchable
          accessibilityLabel={item.productName}
          accessibilityRole="button"
          disabled={busy}
          onPress={openProduct}
        >
          <Text className="text-body-2 text-foreground" numberOfLines={1}>
            {item.productName}
          </Text>
        </Touchable>

        {/* 옵션과 상태가 쓰는 두 줄. 상태 줄은 있다 없다 하지만 자리는 늘 지킨다 —
            아니면 같은 목록의 줄 높이가 서로 달라진다. */}
        <View className="mt-1" style={{ height: CART_META_HEIGHT }}>
          <Text className="text-body-5 text-neutral" numberOfLines={1}>
            {item.optionText}
          </Text>
          <LineStatus item={item} />
        </View>

        <View
          className="mt-1 flex-row items-baseline"
          style={{ height: LINE_BODY_2 }}
        >
          {hasDiscount ? (
            <Text className="text-body-5 text-neutral mr-2 line-through">
              {formatPrice(item.price)}
            </Text>
          ) : null}
          <Text className="text-body-2 text-foreground font-bold">
            {formatPrice(unitPrice)}
          </Text>
        </View>

        <View style={{ marginTop: Spacing.tight }}>
          <QuantityStepper
            disabled={busy || unavailable}
            label={item.productName}
            max={getMaxLineQuantity(item.stockQuantity)}
            onChange={onChangeQuantity}
            value={item.quantity}
          />
        </View>
      </View>

      <Touchable
        accessibilityLabel={`Remove ${item.productName} from cart`}
        accessibilityRole="button"
        className="items-center justify-center self-start"
        onPress={onRemove}
        style={{ width: REMOVE_TOUCH, height: REMOVE_TOUCH }}
      >
        <CloseIcon color={REMOVE_ICON_COLOR} size={REMOVE_ICON_SIZE} />
      </Touchable>
    </View>
  );
}

/**
 * 메타 두 번째 줄. 품절이 먼저다 — 둘 다 적으면 "Sold out · Only 2 left" 처럼 모순돼 보인다.
 *
 * 품절·판매중지는 danger 로 말한다(주문을 막는 사실이다). 재고가 적다는 말은 막는 것이
 * 아니라 서두르라는 것이라 색을 빌리지 않고 굵기로만 세운다 — 브랜드 주황은 이 앱에서
 * "고른 것 · 갈 수 있는 곳"만 뜻한다.
 */
function LineStatus({ item }: { item: UserCartItem }) {
  if (isCartItemUnavailable(item)) {
    return (
      <Text className="text-body-5 text-danger font-bold" numberOfLines={1}>
        Sold out
      </Text>
    );
  }

  if (isCartItemLowStock(item)) {
    return (
      <Text className="text-body-5 text-foreground font-bold" numberOfLines={1}>
        {`Only ${item.stockQuantity} left`}
      </Text>
    );
  }

  return null;
}

/**
 * 금액 요약. 여기 적히는 숫자는 **전부 서버가 계산한 값 그대로**다 — 더하지도, 배송비
 * 규칙을 흉내 내지도 않는다. 무료배송 기준액도 외섬 규칙도 서버만 알고, 화면에서 다시
 * 계산하는 순간 서버와 다른 금액을 말하게 된다.
 *
 * 그래서 수량을 바꾸거나 줄을 지우면 낙관적으로 고치지 않고 장바구니를 다시 읽는다.
 */
function CartSummary({ cart }: { cart: GetUserCartRes }) {
  return (
    <View
      className="border-neutral-subtle mx-5 rounded-lg border p-4"
      style={{ marginTop: Spacing.section }}
    >
      <SummaryRow label="Total" value={formatPrice(cart.totalProductAmount)} />
      {/* 배송지가 아직 없어 본섬 기준으로 계산한 값이다. 금액 옆에서 바로 알 수 있어야
          이 숫자를 확정 배송비로 읽지 않는다 — 확정은 주문서에서 한다. */}
      <SummaryRow
        label="Shipping fee (main island est.)"
        value={
          cart.estimatedShippingFee > 0
            ? formatPrice(cart.estimatedShippingFee)
            : "Free"
        }
      />
      {/* 이미 무료배송이면 자리만 비워 둔다 — 수량을 바꿀 때마다 카드 높이가 들썩이지 않게. */}
      <View style={{ height: LINE_BODY_5 }}>
        {cart.amountToFreeShipping > 0 ? (
          <Text className="text-body-5 text-foreground font-bold">
            {`Add ${formatPrice(cart.amountToFreeShipping)} more for free shipping`}
          </Text>
        ) : null}
      </View>

      {/* 브랜드별로 묶어 보여 주었으니, 배송비가 그 묶음 수만큼 붙지 않는다고 말해 둔다. */}
      <Text
        className="text-body-5 text-neutral"
        style={{ marginTop: Spacing.tight }}
      >
        Shipping is charged once per order, even across different brands.
      </Text>

      <View
        className="border-neutral-subtle border-t"
        style={{ marginTop: Spacing.tight }}
      >
        <SummaryRow
          emphasis
          label="Estimated total"
          value={formatPrice(cart.estimatedTotalAmount)}
        />
      </View>

      <Text className="text-body-5 text-neutral">
        {`Shipping is finalized at checkout based on your address. Outlying islands: ${formatPrice(cart.remoteIslandFee)}.`}
      </Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  /** 이 요약이 말하려는 한 줄. 나머지는 그 줄을 설명하는 보조다. */
  emphasis?: boolean;
}) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ height: SUMMARY_ROW_HEIGHT }}
    >
      <Text
        className={
          emphasis
            ? "text-body-2 text-foreground flex-1 pr-3"
            : "text-body-2 text-neutral flex-1 pr-3"
        }
        numberOfLines={2}
      >
        {label}
      </Text>
      <Text
        className={
          emphasis
            ? "text-body-2 text-foreground font-bold"
            : "text-body-2 text-foreground"
        }
      >
        {value}
      </Text>
    </View>
  );
}
