"use client";

import { toast } from "sonner";

import { cn } from "@shared/lib/style";

import { CustomInfoForm } from "./CustomInfoForm";
import { useCreateUserFitMutation } from "../api/useCreateUserFitMutation";
import { useGetUserFitQuery } from "../api/useGetUserFitQuery";
import { useUpdateUserFitMutation } from "../api/useUpdateUserFitMutation";
import {
  type CustomInfoFormValues,
  fitToFormValues,
  formValuesToFitPayload,
} from "../lib/adapters";

interface CustomInfoSectionProps {
  className?: string;
}

export function CustomInfoSection({ className }: CustomInfoSectionProps) {
  const { data: fit, isLoading } = useGetUserFitQuery();
  const { mutate: createFit, isPending: creating } = useCreateUserFitMutation();
  const { mutate: updateFit, isPending: updating } = useUpdateUserFitMutation();

  const handleSubmit = (values: CustomInfoFormValues) => {
    const payload = formValuesToFitPayload(values);
    const run = fit ? updateFit : createFit;

    run(payload, {
      onSuccess: () => toast.success("맞춤 정보가 저장되었습니다."),
    });
  };

  return (
    <section
      className={cn(
        "flex w-[598px] flex-col gap-10 max-sm:w-full max-sm:gap-8",
        className,
      )}
    >
      <h2 className="text-title-4 sm:text-title-3 font-bold text-black">
        나의 맞춤 정보
      </h2>

      {isLoading ? (
        <p className="text-body-3 text-black/40">불러오는 중...</p>
      ) : (
        <CustomInfoForm
          defaultValues={fit ? fitToFormValues(fit) : undefined}
          heightLabel="키"
          key={fit ? "edit" : "create"}
          onSubmit={handleSubmit}
          submitLabel="저장하기"
          submitting={creating || updating}
          weightLabel="몸무게"
        />
      )}
    </section>
  );
}
