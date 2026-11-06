"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useForm } from "react-hook-form";

import { useLanguage } from "@shared/lib/hooks";
import { findZipCode } from "@shared/lib/regions";
import {
  getLogisticsCvsMapUrl,
  type CvsChain,
} from "@shared/services/logistics";
import type { UserInfo, UserProfile } from "@shared/services/user";
import type {
  UserOrderCvsPickup,
  UserOrderPaymentMethod,
  UserOrderShipping,
  UserOrderShippingType,
} from "@shared/services/userOrder";

import { getPathname } from "@/i18n/navigation";

import { useLogisticsCvsStoreQuery } from "@entities/logistics";
import { toOrderHref, type OrderSource } from "@entities/order";

import type { OrderInvoiceValues } from "./invoiceSchema";
import { navigateTo } from "./navigate";
import { saveOrderDraft, takeOrderDraft } from "./orderDraft";
import {
  orderCvsPickupResolver,
  orderCvsPickupSchema,
  orderShippingResolver,
  orderShippingSchema,
  toCvsPhone,
  toLocalMobile,
  toTaiwanMobileE164,
  type OrderCvsPickupValues,
  type OrderShippingValues,
} from "./schema";

/** `/order?cart=1,2` 에서 `?cart=1,2` 만 떼어 낸다. 주문 대상이 없으면 빈 문자열 */
const toQueryString = (href: string | null): string => {
  if (!href) return "";
  const index = href.indexOf("?");
  return index < 0 ? "" : href.slice(index);
};

interface UseOrderShippingParams {
  profile?: UserProfile;
  userInfo?: UserInfo;
  /** 주문 대상. draft 의 주인을 가리는 키이자 지도로 떠날 때 저장하는 값이다 */
  source: OrderSource | null;
  /**
   * 지도 왕복 draft 에 같이 싣는 다른 섹션(전자발표)의 입력. 떠날 때 `getDraft`, 돌아와
   * 복원할 때 `restoreDraft` 를 부른다. 호출부는 안정된 객체(useMemo)를 넘긴다.
   */
  invoice?: {
    getDraft(): OrderInvoiceValues;
    restoreDraft(values: OrderInvoiceValues | undefined): void;
  };
}

/** 미리보기에 넘기는 배송 입력. 편의점은 매장 조회가 끝난 뒤에만 토큰을 품는다 */
export type OrderPreviewShipping =
  | { shippingType: "HOME"; city?: string; district?: string }
  | { shippingType: "CVS"; cvsStoreToken?: string };

/** 주문 생성에 그대로 넣을 배송 분기. `CreateUserOrderReq` 의 유니온과 모양을 맞춘다 */
export type OrderSubmitShipping =
  | { shippingType: "HOME"; useDefaultShipping: true }
  | {
      shippingType: "HOME";
      useDefaultShipping: false;
      shipping: UserOrderShipping;
    }
  | { shippingType: "CVS"; cvsPickup: UserOrderCvsPickup };

const EMPTY_VALUES: OrderShippingValues = {
  recipientName: "",
  phone: "",
  postalCode: "",
  city: "",
  district: "",
  detailAddress: "",
  requestMessage: "shipping_request_none",
};

const EMPTY_CVS_VALUES: OrderCvsPickupValues = {
  recipientName: "",
  phone: "",
};

/** 기본 배송지가 실제로 배송 가능한 주소인지. 한 칸이라도 비면 체크를 켤 수 없다 */
const isDeliverable = (profile?: UserProfile, phone?: string) =>
  !!profile?.name &&
  !!profile.city &&
  !!profile.district &&
  !!profile.detailAddress &&
  !!phone;

const toFormValues = (
  profile?: UserProfile,
  phone?: string,
): OrderShippingValues => ({
  ...EMPTY_VALUES,
  recipientName: profile?.name ?? "",
  // 입력 칸은 `+886` 뒤 자리만 들고 있다. 프로필에는 어떤 형식으로든 저장돼 있다.
  phone: toLocalMobile(phone ?? ""),
  postalCode:
    profile?.postalCode ?? findZipCode(profile?.city, profile?.district) ?? "",
  city: profile?.city ?? "",
  district: profile?.district ?? "",
  detailAddress: profile?.detailAddress ?? "",
});

/**
 * 주문서 배송 상태. 택배/편의점 탭, 두 탭의 폼, 고른 매장, 결제수단, 지도 왕복 draft 까지
 * 한곳에서 든다 — 지도로 떠날 때 저장하고 돌아와 복원할 것이 바로 이 묶음이라서다.
 *
 * 택배는 기본 배송지를 쓰는 동안에도 **같은 폼 값**을 채워둔다 — 배송비는 縣市·區로
 * 정해지므로 어느 모드든 화면이 읽는 주소가 한 곳이어야 미리보기 호출이 갈라지지 않는다.
 * 프로필이 늦게 도착하면(첫 렌더에는 없다) 그때 한 번 값을 심는다.
 */
export const useOrderShipping = ({
  profile,
  userInfo,
  source,
  invoice,
}: UseOrderShippingParams) => {
  const locale = useLanguage();
  const phone = userInfo?.phone;
  const canUseDefault = isDeliverable(profile, phone);
  const sourceHref = source ? toOrderHref(source) : null;

  const [shippingMethod, setShippingMethod] =
    useState<UserOrderShippingType>("HOME");
  const [paymentMethod, setPaymentMethod] =
    useState<UserOrderPaymentMethod>("ECPAY");
  const [useDefaultShipping, setUseDefaultShippingState] = useState(true);

  const form = useForm<OrderShippingValues>({
    resolver: orderShippingResolver,
    defaultValues: EMPTY_VALUES,
    mode: "onBlur",
  });

  const cvsForm = useForm<OrderCvsPickupValues>({
    resolver: orderCvsPickupResolver,
    defaultValues: EMPTY_CVS_VALUES,
    mode: "onBlur",
  });

  const [chain, setChain] = useState<CvsChain | null>(null);
  const [storeToken, setStoreToken] = useState<string | null>(null);
  // 쿼리 에러에서 파생하지 않는다 — 토큰을 비우면 쿼리가 꺼져 에러도 사라지므로
  // 에러를 보고 만료를 그리면 곧바로 false 로 돌아간다.
  const [isStoreExpired, setIsStoreExpired] = useState(false);

  const {
    data: store,
    isLoading: isStoreLoading,
    error: storeError,
    refetch: refetchStore,
  } = useLogisticsCvsStoreQuery(storeToken);

  // 404 는 만료(토큰을 비우고 다시 고르게 한다). 그 밖 오류는 토큰을 지킨 채 다시 시도한다 —
  // 지도를 다녀온 직후 네트워크가 잠깐 끊긴 것뿐인데 매장을 다시 고르게 하면 안 된다.
  const isStoreError = !!storeError && storeError.response?.status !== 404;

  const { reset, setValue, watch, getValues } = form;
  const { reset: resetCvs, watch: watchCvs, getValues: getCvsValues } = cvsForm;

  /**
   * 복원된 직접 입력 주소를 프로필 주입이 덮지 않게 막는 표식. 복원 효과와 프로필 효과가
   * 같은 커밋에서 연달아 돌므로 state 가 아니라 ref 로 즉시 전한다. 사용자가 기본 배송지를
   * 다시 켜면 그때는 프로필로 채워야 하니 표식을 거둔다.
   */
  const skipProfileFillRef = useRef(false);

  const setUseDefaultShipping = useCallback((next: boolean) => {
    skipProfileFillRef.current = false;
    setUseDefaultShippingState(next);
  }, []);

  const restoredRef = useRef(false);

  useEffect(
    function restoreDraft() {
      if (restoredRef.current || !sourceHref) return;
      restoredRef.current = true;

      const draft = takeOrderDraft(sourceHref);
      if (!draft) return;

      skipProfileFillRef.current = !draft.home.useDefaultShipping;
      setShippingMethod(draft.shippingMethod);
      setPaymentMethod(draft.paymentMethod);
      setUseDefaultShippingState(draft.home.useDefaultShipping);
      reset(draft.home.values);
      setChain(draft.cvs.chain);
      setStoreToken(draft.cvs.storeToken);
      setIsStoreExpired(false);
      resetCvs({
        recipientName: draft.cvs.recipientName,
        phone: draft.cvs.phone,
      });
      invoice?.restoreDraft(draft.invoice);
    },
    [sourceHref, reset, resetCvs, invoice],
  );

  useEffect(
    function fillFromProfile() {
      if (skipProfileFillRef.current || !canUseDefault || !useDefaultShipping)
        return;

      reset(toFormValues(profile, phone));
    },
    [canUseDefault, useDefaultShipping, profile, phone, reset],
  );

  useEffect(
    function fillCvsFromProfile() {
      const current = getCvsValues();
      if (current.recipientName || current.phone) return;
      if (!profile?.name && !phone) return;

      resetCvs({
        recipientName: profile?.name ?? "",
        phone: toCvsPhone(phone ?? ""),
      });
    },
    [profile?.name, phone, getCvsValues, resetCvs],
  );

  useEffect(
    function expireStore() {
      if (storeError?.response?.status !== 404) return;

      setIsStoreExpired(true);
      setStoreToken(null);
    },
    [storeError],
  );

  const city = watch("city");
  const district = watch("district");

  /** 縣市 를 바꾸면 區 는 더 이상 유효하지 않다. 우편번호도 함께 비운다 */
  const handleCityChange = useCallback(
    (next: string) => {
      setValue("city", next, { shouldValidate: true });
      setValue("district", "");
      setValue("postalCode", "");
    },
    [setValue],
  );

  /** 區 가 정해지면 우편번호는 하나로 결정된다 — 사용자가 외울 이유가 없다 */
  const handleDistrictChange = useCallback(
    (next: string) => {
      setValue("district", next, { shouldValidate: true });
      setValue("postalCode", findZipCode(city, next) ?? "");
    },
    [city, setValue],
  );

  /**
   * 전자지도로 떠난다. 떠나기 직전에 입력 전부를 draft 로 남기고, 복귀 주소에는 주문 대상
   * 쿼리(`?cart=`/`?buy=`)까지 붙여 넘긴다 — 서버가 `&cvsStoreToken=` 을 합쳐 같은 주문서로
   * 돌려보낸다. draft 의 `sourceHref` 는 쿼리가 유실됐을 때의 대비다.
   */
  const leaveForMap = useCallback(
    (next: CvsChain) => {
      if (sourceHref) {
        const cvsValues = getCvsValues();

        saveOrderDraft({
          sourceHref,
          shippingMethod: "CVS",
          home: { useDefaultShipping, values: getValues() },
          cvs: {
            chain: next,
            storeToken: null,
            recipientName: cvsValues.recipientName,
            phone: cvsValues.phone,
          },
          paymentMethod,
          invoice: invoice?.getDraft(),
        });
      }

      setChain(next);
      setIsStoreExpired(false);
      navigateTo(
        getLogisticsCvsMapUrl({
          chain: next,
          returnUrl: `${window.location.origin}${getPathname({ href: "/order", locale })}${toQueryString(sourceHref)}`,
        }),
      );
    },
    [
      sourceHref,
      getCvsValues,
      getValues,
      useDefaultShipping,
      paymentMethod,
      locale,
      invoice,
    ],
  );

  /** 체인 칩. 이미 고른 매장의 체인이면 그대로 둔다 — 다시 고르는 길은 `reselectStore` 다 */
  const openCvsMap = useCallback(
    (next: CvsChain) => {
      if (next === chain && storeToken && store) return;

      leaveForMap(next);
    },
    [chain, storeToken, store, leaveForMap],
  );

  /** 카드의 "매장 다시 고르기". 같은 체인이라도 지도로 간다 */
  const reselectStore = useCallback(() => {
    if (chain) leaveForMap(chain);
  }, [chain, leaveForMap]);

  const retryStore = useCallback(() => {
    void refetchStore();
  }, [refetchStore]);

  /** 주문 생성이 매장 토큰 만료(400)를 돌려줬을 때. 404 조회 만료와 같은 화면으로 보낸다 */
  const expireStore = useCallback(() => {
    setIsStoreExpired(true);
    setStoreToken(null);
  }, []);

  const values = watch();
  const cvsValues = watchCvs();

  /**
   * 필수 항목이 다 찼는지 — `결제하기` 활성 여부가 이 값 하나로 정해진다.
   *
   * 리졸버가 쓰는 스키마로 직접 판정한다. `formState.isValid` 는 기본 배송지를 `reset` 으로
   * 심었을 때 갱신되지 않아 다 채워진 주소에도 false 로 남는다 — `trigger()` 로 깨울 수는
   * 있지만 그러면 손대지도 않은 필드에 에러 문구가 뜬다. 편의점은 매장까지 있어야 한다.
   */
  const isHomeValid = orderShippingSchema.safeParse(values).success;
  const isCvsValid =
    !!store && orderCvsPickupSchema.safeParse(cvsValues).success;
  const isValid = shippingMethod === "CVS" ? isCvsValid : isHomeValid;

  /**
   * 서버로 보낼 배송지. 기본 배송지를 쓰면 `shipping` 을 보내지 않는 것이 스웨거 규칙이고,
   * 그 규칙은 `CreateUserOrderReq` 의 유니온 타입이 이미 강제한다.
   */
  const shipping = useMemo<UserOrderShipping>(
    () => ({
      recipientName: values.recipientName.trim(),
      phone: toTaiwanMobileE164(values.phone),
      postalCode: values.postalCode,
      city: values.city,
      district: values.district,
      detailAddress: values.detailAddress.trim(),
    }),
    [values],
  );

  const previewShipping = useMemo<OrderPreviewShipping>(() => {
    if (shippingMethod === "CVS") {
      return store
        ? { shippingType: "CVS", cvsStoreToken: store.storeToken }
        : { shippingType: "CVS" };
    }

    return {
      shippingType: "HOME",
      city: city || undefined,
      district: district || undefined,
    };
  }, [shippingMethod, store, city, district]);

  const submitShipping = useMemo<OrderSubmitShipping | null>(() => {
    if (!isValid) return null;

    if (shippingMethod === "CVS") {
      if (!store) return null;

      return {
        shippingType: "CVS",
        cvsPickup: {
          storeToken: store.storeToken,
          recipientName: cvsValues.recipientName.trim(),
          phone: toCvsPhone(cvsValues.phone),
        },
      };
    }

    return canUseDefault && useDefaultShipping
      ? { shippingType: "HOME", useDefaultShipping: true }
      : { shippingType: "HOME", useDefaultShipping: false, shipping };
  }, [
    isValid,
    shippingMethod,
    store,
    cvsValues,
    canUseDefault,
    useDefaultShipping,
    shipping,
  ]);

  return {
    form,
    /** 프로필에 주소·연락처가 다 있을 때만 기본 배송지를 고를 수 있다 */
    canUseDefault,
    useDefaultShipping: canUseDefault && useDefaultShipping,
    setUseDefaultShipping,
    handleCityChange,
    handleDistrictChange,
    /** 배송비 확정에 필요한 지역. 둘 중 하나라도 비면 미리보기를 부르지 않는다 */
    city,
    district,
    shipping,
    shippingMethod,
    setShippingMethod,
    paymentMethod,
    setPaymentMethod,
    cvs: {
      chain,
      storeToken,
      store,
      isStoreLoading,
      isStoreExpired,
      isStoreError,
      form: cvsForm,
      openCvsMap,
      reselectStore,
      retryStore,
      expireStore,
    },
    previewShipping,
    isValid,
    submitShipping,
  };
};
