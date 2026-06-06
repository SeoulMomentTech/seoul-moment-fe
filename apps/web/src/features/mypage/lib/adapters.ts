import type { ProductItem } from "@shared/services/product";
import type {
  GetUserFitRes,
  UpdateUserFitReq,
  UpdateUserProfileReq,
  UserInfo,
  UserProfile,
} from "@shared/services/user";
import type { UserRecentProduct } from "@shared/services/userRecent";

import type { SizeType } from "./sizeOptions";

export interface CustomInfoFormValues {
  height: string;
  weight: string;
  sizeValues: Partial<Record<SizeType, string>>;
}

export function fitToFormValues(fit: GetUserFitRes): CustomInfoFormValues {
  return {
    height: fit.height == null ? "" : String(fit.height),
    weight: fit.weight == null ? "" : String(fit.weight),
    sizeValues: {
      shoes: fit.shoeSize == null ? "" : String(fit.shoeSize),
      outer: fit.outerSize ?? "",
      top: fit.topSize ?? "",
      bottom: fit.bottomSize ?? "",
    },
  };
}

export function formValuesToFitPayload(
  values: CustomInfoFormValues,
): UpdateUserFitReq {
  const { bottom, outer, shoes, top } = values.sizeValues;

  return {
    height: values.height.trim() === "" ? null : Number(values.height),
    weight: values.weight.trim() === "" ? null : Number(values.weight),
    shoeSize: shoes ? Number(shoes) : null,
    outerSize: outer || null,
    topSize: top || null,
    bottomSize: bottom || null,
  };
}

export function toProductItem(p: UserRecentProduct): ProductItem {
  return {
    id: p.productItemId,
    brandName: p.brandName,
    productName: p.productName,
    price: p.price,
    like: p.like,
    review: p.review,
    reviewAverage: p.reviewAverage,
    image: p.imageUrl,
    colorName: "",
    colorCode: "",
    isLiked: false,
  };
}

export interface ProfileFormValues {
  nickname: string;
  name: string;
  gender?: UserProfile["gender"];
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
  postalCode: string;
  city?: string;
  district?: string;
  detailAddress: string;
}

export function profileToFormValues(profile: UserProfile): ProfileFormValues {
  const [year, month, day] = (profile.birthDate ?? "").split("-");

  return {
    nickname: profile.nickname ?? "",
    name: profile.name ?? "",
    gender: profile.gender,
    birthYear: year || undefined,
    birthMonth: month ? String(Number(month)) : undefined,
    birthDay: day ? String(Number(day)) : undefined,
    postalCode: profile.postalCode ?? "",
    city: profile.city || undefined,
    district: profile.district || undefined,
    detailAddress: profile.detailAddress ?? "",
  };
}

const pad2 = (value: string) => value.padStart(2, "0");

export function formValuesToProfilePayload(
  values: ProfileFormValues,
): UpdateUserProfileReq {
  const birthDate =
    values.birthYear && values.birthMonth && values.birthDay
      ? `${values.birthYear}-${pad2(values.birthMonth)}-${pad2(values.birthDay)}`
      : "";

  return {
    gender: values.gender ?? "OTHER",
    birthDate,
    postalCode: values.postalCode.trim(),
    city: values.city ?? "",
    district: values.district ?? "",
    detailAddress: values.detailAddress.trim(),
  };
}

export type AgreementKey = "newProductAgreed" | "adAgreed" | "recommendAgreed";

export type AgreementValues = Record<AgreementKey, boolean>;

export function userInfoToAgreements(info: UserInfo): AgreementValues {
  return {
    newProductAgreed: info.newProductAgreed,
    adAgreed: info.adAgreed,
    recommendAgreed: info.recommendAgreed,
  };
}
