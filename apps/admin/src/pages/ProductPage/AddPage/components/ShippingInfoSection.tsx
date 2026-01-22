import type { FormikProps } from "formik";

import { Input, Label } from "@seoul-moment/ui";

import type { ProductFormValues } from "../types";

interface ShippingInfoSectionProps {
  formik: FormikProps<ProductFormValues>;
  isPending: boolean;
}

export function ShippingInfoSection({
  formik,
  isPending,
}: ShippingInfoSectionProps) {
  const { values, handleChange } = formik;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-base font-semibold">배송 정보</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 px-6 py-5">
        <div className="space-y-2">
          <Label htmlFor="shippingCost">배송비 *</Label>
          <Input
            className="h-[40px] bg-white"
            disabled={isPending}
            id="shippingCost"
            name="shippingCost"
            onChange={handleChange}
            placeholder="배송비"
            type="number"
            value={values.shippingCost}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shippingInfo">배송 소요 예상일 *</Label>
          <Input
            className="h-[40px] bg-white"
            disabled={isPending}
            id="shippingInfo"
            name="shippingInfo"
            onChange={handleChange}
            placeholder="배송 소요 예상일"
            type="number"
            value={values.shippingInfo}
          />
        </div>
      </div>
    </div>
  );
}
