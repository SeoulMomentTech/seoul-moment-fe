"use client";

import { ChevronLeft } from "lucide-react";

import useMediaQuery from "@shared/lib/hooks/useMediaQuery";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@seoul-moment/ui";

import { CustomInfoForm, type CustomInfoFormValues } from "./CustomInfoForm";

interface UserSizeInfoModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  onSubmit?(values: CustomInfoFormValues): void;
}

export function UserSizeInfoModal({
  open,
  onOpenChange,
  onSubmit,
}: UserSizeInfoModalProps) {
  const isMobile = useMediaQuery("(max-width: 639px)");

  const laterButton = (
    <button
      className="text-body-3 self-center py-2 text-black/50 underline"
      onClick={() => onOpenChange(false)}
      type="button"
    >
      나중에 하기
    </button>
  );

  const handleSubmit = (values: CustomInfoFormValues) => {
    onSubmit?.(values);
    onOpenChange(false);
  };

  const form = (
    <CustomInfoForm
      footer={laterButton}
      heightLabel="신장 (Height)"
      onSubmit={handleSubmit}
      submitLabel={isMobile ? "확인" : "저장하기"}
      weightLabel="몸무게 (Weight)"
    />
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent className="border-none data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:h-screen data-[vaul-drawer-direction=bottom]:max-h-screen data-[vaul-drawer-direction=bottom]:rounded-none">
          <div className="flex h-full flex-col gap-[28px] overflow-y-auto px-[20px] pb-[24px] pt-[12px]">
            <div className="flex items-center">
              <button
                aria-label="뒤로"
                className="text-black"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                <ChevronLeft className="size-6" />
              </button>
              <span className="text-body-2 flex-1 font-semibold text-black">
                추가 정보 입력하기
              </span>
              <span className="size-6" />
            </div>

            <div className="flex flex-col gap-2 text-center">
              <DrawerTitle className="text-title-4 font-bold text-black">
                환영합니다.
              </DrawerTitle>
              <DrawerDescription className="text-body-2 text-black/50">
                더 편리한 이용을 위해 몇 가지 설정이 필요해요.
              </DrawerDescription>
            </div>

            {form}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-[28px] overflow-y-auto border-none px-[24px] pb-[24px] pt-[32px] sm:max-w-[460px]"
        showCloseButton={false}
      >
        <div className="flex flex-col gap-2 text-center">
          <DialogTitle className="text-title-4 font-bold text-black">
            환영합니다.
          </DialogTitle>
          <DialogDescription className="text-body-2 text-black/50">
            더 편리한 이용을 위해 몇 가지 설정이 필요해요.
          </DialogDescription>
        </div>

        <h2 className="text-title-3 font-bold text-black">나의 맞춤 정보</h2>

        {form}
      </DialogContent>
    </Dialog>
  );
}
