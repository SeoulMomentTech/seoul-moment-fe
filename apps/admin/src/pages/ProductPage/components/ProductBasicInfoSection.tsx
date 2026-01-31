import type { FormikProps } from "formik";

import { Input, Label } from "@seoul-moment/ui";

import type { ProductFormValues } from "../types";

interface ProductBasicInfoSectionProps {
  formik: FormikProps<ProductFormValues>;
  isPending: boolean;
}

export function ProductBasicInfoSection({
  formik,
  isPending,
}: ProductBasicInfoSectionProps) {
  const { values, handleChange } = formik;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-base font-semibold">상품 기본 정보</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 px-6 py-5">
        <div className="space-y-2">
          <Label htmlFor="productId">상품 대주제 ID *</Label>
          <Input
            className="h-[40px] bg-white"
            disabled={isPending}
            id="productId"
            name="productId"
            onChange={handleChange}
            placeholder="상품 ID"
            type="number"
            value={values.productId}
          />
          {formik.errors.productId && (
            <p className="text-xs text-red-500">{formik.errors.productId}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">가격 *</Label>
          <Input
            className="h-[40px] bg-white"
            disabled={isPending}
            id="price"
            name="price"
            onChange={handleChange}
            placeholder="가격"
            type="number"
            value={values.price}
          />
          {formik.errors.price && (
            <p className="text-xs text-red-500">{formik.errors.price}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountPrice">할인가</Label>
          <Input
            className="h-[40px] bg-white"
            disabled={isPending}
            id="discountPrice"
            name="discountPrice"
            onChange={handleChange}
            placeholder="할인가"
            type="number"
            value={values.discountPrice}
          />
        </div>
      </div>
    </div>
  );
}
