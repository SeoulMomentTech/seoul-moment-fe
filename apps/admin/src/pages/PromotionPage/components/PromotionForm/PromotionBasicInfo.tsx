import { useFormContext } from "react-hook-form";

import { Input, Label } from "@seoul-moment/ui";

import type { PromotionFormValues } from "../../hooks/usePromotionForm";

export function PromotionBasicInfo() {
  const { register, formState: { errors } } = useFormContext<PromotionFormValues>();

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-base font-semibold">기본 정보</h3>
      </div>
      <div className="px-6 py-5">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>
              활성 상태 <span className="text-red-500">*</span>
            </Label>
            <div className="flex h-[36px] items-center space-x-2">
              <input
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="isActive"
                type="checkbox"
                {...register("isActive")}
              />
              <Label className="cursor-pointer" htmlFor="isActive">
                활성화
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">
              시작일 <span className="text-red-500">*</span>
            </Label>
            <Input
              className={errors.startDate ? "border-red-500" : ""}
              id="startDate"
              type="date"
              {...register("startDate")}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.startDate.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">
              종료일 <span className="text-red-500">*</span>
            </Label>
            <Input
              className={errors.endDate ? "border-red-500" : ""}
              id="endDate"
              type="date"
              {...register("endDate")}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
