import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOrderPreview } from "@entities/order/model/useOrderPreview";
import { useUserInfo } from "@entities/user/model/useUserInfo";
import { useUserProfile } from "@entities/user/model/useUserProfile";
import { Field, FormSection, FormSections } from "@features/account/ui/parts";
import { AuthField } from "@features/auth/ui/AuthField";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import { getCityOptions, getDistrictOptions } from "@shared/lib/regions";
import type {
  UserCartBrandGroup,
  UserCartItem,
} from "@shared/services/userCart";
import type {
  PostUserOrderPreviewRes,
  UserOrderPaymentMethod,
} from "@shared/services/userOrder";
import { BUTTON_HEIGHT, Button } from "@shared/ui/button";
import { Chip, CHIP_GAP } from "@shared/ui/chip";
import { EMPTY_ICON_SIZE, CartIcon } from "@shared/ui/icons";
import { ScreenHeader } from "@shared/ui/screen-header";
import { EmptyState, ScreenError } from "@shared/ui/section-state";
import { SelectField } from "@shared/ui/select";
import { CartSkeleton } from "@shared/ui/skeleton";

import { Spacing } from "@/constants/theme";

import { useOrderShipping } from "../model/useOrderShipping";

const THUMB_SIZE = 64;
const POSTAL_CODE_MAX_LENGTH = 5;
// 빈 화면 아이콘 색. SVG 는 className 을 못 받아 --neutral-600 값을 직접 쓴다.
const EMPTY_ICON_COLOR = "#707070";

const formatPrice = (value: number) => `NT$${value.toLocaleString("en-US")}`;

const PAYMENT_METHODS: readonly {
  value: UserOrderPaymentMethod;
  label: string;
}[] = [
  { value: "LINE_PAY", label: "LINE Pay" },
  { value: "ECPAY", label: "ECPay" },
];

/**
 * 주문서. 장바구니에서 넘어온 라인을 확인하고 배송지를 채우면 배송비가 확정된다.
 *
 * **결제는 아직 할 수 없다.** 이 API 에는 외부 결제창 URL 을 받는 엔드포인트가 없어서
 * (스웨거 152개 경로 중 0개) `POST user/order` 를 불러 봐야 낼 방법이 없는 주문만 쌓인다.
 * web 의 주문서도 같은 이유로 "결제하기"가 아무것도 하지 않는다. 버튼을 잠가 두고
 * 그 아래에서 이유를 말한다 — 눌리는데 아무 일도 안 일어나는 것보다 낫다.
 *
 * 라인 목록과 금액을 한 응답(미리보기)에서 읽는다. 목록은 장바구니에서, 금액은 여기서
 * 읽으면 다른 기기에서 수량을 바꾼 순간 둘이 갈라지고 어느 쪽이 옳은지 알 수 없어진다.
 */
export function OrderScreen({ cartItemIds }: { cartItemIds: number[] }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const locale = useLanguage();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);

  const profile = useUserProfile();
  const userInfo = useUserInfo();
  const shipping = useOrderShipping({
    profile: profile.data,
    userInfo: userInfo.data,
  });

  const preview = useOrderPreview({
    cartItemIds,
    city: shipping.values.city,
    district: shipping.values.district,
  });

  // 쿼리가 꺼져 있으면 isPending 이 영원히 유지되므로 데이터 갈래보다 먼저 거른다.
  if (!isAuthenticated) {
    return (
      <Shell>
        <EmptyState
          hint="Sign in from the My tab to place an order."
          icon={<CartIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />}
          message="You're signed out"
        />
      </Shell>
    );
  }

  if (cartItemIds.length === 0) {
    return (
      <Shell>
        <EmptyState
          hint="Add something to your cart first."
          icon={<CartIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />}
          message="There's nothing to order"
        />
      </Shell>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (preview.isPending && preview.fetchStatus === "paused") {
    return (
      <Shell>
        <ScreenError offline onRetry={() => void preview.refetch()} />
      </Shell>
    );
  }

  if (preview.isPending) {
    return (
      <Shell>
        <ScrollView contentContainerStyle={{ paddingTop: Spacing.inner }}>
          <CartSkeleton />
        </ScrollView>
      </Shell>
    );
  }

  if (preview.isError || !preview.data) {
    return (
      <Shell>
        <ScreenError onRetry={() => void preview.refetch()} />
      </Shell>
    );
  }

  const groups = preview.data.brandGroups ?? [];

  if (groups.length === 0) {
    return (
      <Shell>
        <EmptyState
          hint="These items may have sold out."
          icon={<CartIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />}
          message="None of these can be ordered"
        />
      </Shell>
    );
  }

  const cityOptions = getCityOptions(locale);
  const districtOptions = getDistrictOptions(shipping.values.city, locale);

  return (
    <Shell>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: Spacing.inner,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-title-3 text-foreground font-bold">Order</Text>

          <View style={{ marginTop: Spacing.section }}>
            <FormSections>
              <FormSection title="Items">
                <View style={{ gap: Spacing.inner }}>
                  {groups.map((group) => (
                    <BrandGroup group={group} key={group.brandId} />
                  ))}
                </View>
              </FormSection>

              <FormSection title="Shipping address">
                {shipping.canUseDefault ? (
                  <View
                    className="flex-row"
                    style={{ gap: CHIP_GAP, marginBottom: Spacing.tight }}
                  >
                    <Chip
                      label="Saved address"
                      onPress={() => shipping.setUseDefault(true)}
                      selected={shipping.useDefault}
                    />
                    <Chip
                      label="New address"
                      onPress={() => shipping.setUseDefault(false)}
                      selected={!shipping.useDefault}
                    />
                  </View>
                ) : null}

                <Field label="Recipient">
                  <AuthField
                    onChangeText={(value) =>
                      shipping.edit({ recipientName: value })
                    }
                    placeholder="Name"
                    value={shipping.values.recipientName}
                  />
                </Field>

                <Field label="Mobile number">
                  <AuthField
                    keyboardType="number-pad"
                    onChangeText={(value) => shipping.edit({ phone: value })}
                    placeholder="+886 9xx xxx xxx"
                    value={shipping.values.phone}
                  />
                </Field>

                <Field label="Region">
                  <View style={{ gap: Spacing.tight }}>
                    <AuthField
                      keyboardType="number-pad"
                      maxLength={POSTAL_CODE_MAX_LENGTH}
                      onChangeText={(value) =>
                        shipping.edit({ postalCode: value })
                      }
                      placeholder="Postal Code"
                      value={shipping.values.postalCode}
                    />
                    <SelectField
                      onChange={shipping.selectCity}
                      options={cityOptions}
                      placeholder="City"
                      title="City"
                      value={shipping.values.city}
                    />
                    <SelectField
                      disabled={!shipping.values.city}
                      onChange={shipping.selectDistrict}
                      options={districtOptions}
                      placeholder="District"
                      title="District"
                      value={shipping.values.district}
                    />
                    <AuthField
                      onChangeText={(value) =>
                        shipping.edit({ detailAddress: value })
                      }
                      placeholder="Detailed Address"
                      value={shipping.values.detailAddress}
                    />
                  </View>
                </Field>

                <Field label="Delivery note (optional)">
                  <AuthField
                    onChangeText={(value) =>
                      shipping.edit({ requestMessage: value })
                    }
                    placeholder="Leave it with the front desk, etc."
                    value={shipping.values.requestMessage}
                  />
                </Field>
              </FormSection>

              <FormSection title="Payment method">
                <View className="flex-row" style={{ gap: CHIP_GAP }}>
                  {PAYMENT_METHODS.map((method) => (
                    <Chip
                      key={method.value}
                      label={method.label}
                      // 결제 수단은 고를 수 있지만 쓸 수는 없다. 고른 값을 들고 있어 봐야
                      // 보낼 곳이 없어서, 상태 없이 웹과 같은 선택지만 보여 준다.
                      onPress={() => undefined}
                      selected={method.value === "LINE_PAY"}
                    />
                  ))}
                </View>
              </FormSection>

              <FormSection title="Payment amount">
                <Amounts
                  isRecalculating={preview.isPlaceholderData}
                  preview={preview.data}
                  region={`${shipping.values.city} ${shipping.values.district}`}
                />
              </FormSection>
            </FormSections>
          </View>

          {/* 하단 바가 가리는 만큼 비워 둔다. 바는 안전 영역을 자기가 쥔다. */}
          <View
            style={{ height: BAR_HEIGHT + insets.bottom + Spacing.section }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <OrderBar
        addressReady={shipping.isValid}
        onViewCart={() => router.back()}
        total={
          preview.data.isShippingEstimated
            ? preview.data.totalProductAmount
            : preview.data.totalAmount
        }
      />
    </Shell>
  );
}

/** 계정 화면들과 같은 틀 — 사진 없는 흰 화면이라 스크림 없이 평범한 머리를 둔다. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <ScreenHeader />
      {children}
    </View>
  );
}

function BrandGroup({ group }: { group: UserCartBrandGroup }) {
  return (
    <View>
      <Text className="text-body-5 text-neutral font-bold" numberOfLines={1}>
        {group.brandName}
      </Text>
      <View style={{ marginTop: Spacing.tight, gap: Spacing.tight }}>
        {group.items.map((item) => (
          <OrderItem item={item} key={item.productVariantId} />
        ))}
      </View>
    </View>
  );
}

/** 주문 라인 하나. 여기서는 고칠 수 없다 — 수량과 구성은 장바구니에서 정하고 온다. */
function OrderItem({ item }: { item: UserCartItem }) {
  return (
    <View className="flex-row">
      <Image
        contentFit="cover"
        source={item.imageUrl}
        style={{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8 }}
        transition={200}
      />
      <View className="flex-1" style={{ marginLeft: Spacing.tight }}>
        <Text className="text-body-3 text-foreground" numberOfLines={2}>
          {item.productName}
        </Text>
        <Text className="text-body-5 text-neutral mt-1" numberOfLines={1}>
          {`${item.optionText} · ${item.quantity}`}
        </Text>
        <Text className="text-body-3 text-foreground mt-1 font-bold">
          {formatPrice(item.totalPrice)}
        </Text>
      </View>
    </View>
  );
}

/**
 * 금액. 배송지가 다 차기 전에는 서버가 본섬 기준 예상값을 주는데, 그것을 그대로 적으면
 * 주소를 넣기 전인데 확정 금액처럼 읽힌다. 확정 전에는 배송비 자리에 "주소를 넣으면
 * 정해진다"고 쓰고 합계도 상품 금액만 적는다 — web 주문서와 같은 규칙이다.
 */
function Amounts({
  preview,
  region,
  isRecalculating,
}: {
  preview: PostUserOrderPreviewRes;
  region: string;
  isRecalculating: boolean;
}) {
  const fixed = !preview.isShippingEstimated;

  return (
    <View style={{ opacity: isRecalculating ? 0.4 : 1 }}>
      <AmountRow
        label="Items"
        value={formatPrice(preview.totalProductAmount)}
      />
      <AmountRow
        label={
          fixed
            ? `Shipping · ${region}${preview.isRemoteIsland ? " (outlying island)" : ""}`
            : "Shipping"
        }
        value={
          fixed
            ? preview.shippingFee > 0
              ? formatPrice(preview.shippingFee)
              : "Free"
            : "Set by your address"
        }
      />
      {preview.amountToFreeShipping > 0 ? (
        <Text className="text-body-5 text-foreground font-bold">
          {`Add ${formatPrice(preview.amountToFreeShipping)} more for free shipping`}
        </Text>
      ) : null}
      <View
        className="border-neutral-subtle border-t"
        style={{ marginTop: Spacing.tight }}
      >
        <AmountRow
          emphasis
          label="Total"
          value={formatPrice(
            fixed ? preview.totalAmount : preview.totalProductAmount,
          )}
        />
      </View>
    </View>
  );
}

function AmountRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingVertical: 6 }}
    >
      <Text
        className={
          emphasis
            ? "text-body-2 text-foreground flex-1 font-bold"
            : "text-body-3 text-neutral flex-1"
        }
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        className={
          emphasis
            ? "text-body-2 text-foreground ml-3 font-bold"
            : "text-body-3 text-foreground ml-3"
        }
      >
        {value}
      </Text>
    </View>
  );
}

/** 합계 한 줄 + 안내 + 버튼. 바 높이는 상수라 본문이 같은 값만큼 아래를 비운다. */
const BAR_NOTE_LINE = 17;
const BAR_HEIGHT =
  Spacing.tight * 2 + 20 + Spacing.tight + BUTTON_HEIGHT.lg + 6 + BAR_NOTE_LINE;

function OrderBar({
  total,
  addressReady,
  onViewCart,
}: {
  total: number;
  addressReady: boolean;
  onViewCart(): void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-neutral-subtle bg-background border-t px-5"
      style={{
        paddingTop: Spacing.tight,
        paddingBottom: Spacing.tight + insets.bottom,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-body-3 text-neutral">Total</Text>
        <Text className="text-body-1 text-foreground font-bold">
          {formatPrice(total)}
        </Text>
      </View>
      {/* 아직 낼 수 없으므로 잠가 둔다. 누를 수는 있는데 아무 일도 안 일어나는 것보다 낫다. */}
      <Button
        disabled
        label="Pay now"
        onPress={onViewCart}
        style={{ marginTop: Spacing.tight }}
      />
      <Text
        className="text-body-5 text-neutral"
        numberOfLines={1}
        style={{ marginTop: 6, height: BAR_NOTE_LINE }}
      >
        {addressReady
          ? "Payment isn't available in the app yet."
          : "Enter a shipping address to see the final total."}
      </Text>
    </View>
  );
}
