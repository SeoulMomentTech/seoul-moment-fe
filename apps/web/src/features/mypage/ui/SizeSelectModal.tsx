"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { useTranslations } from "next-intl";

import useMediaQuery from "@shared/lib/hooks/useMediaQuery";
import { cn } from "@shared/lib/style";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@seoul-moment/ui";

interface SizeSelectModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  options: ReadonlyArray<string>;
  value?: string;
  onConfirm(value: string): void;
}

export function SizeSelectModal({
  open,
  onOpenChange,
  title,
  options,
  value,
  onConfirm,
}: SizeSelectModalProps) {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [selected, setSelected] = useState<string | undefined>(value);
  const t = useTranslations();

  useEffect(() => {
    if (open) setSelected(value);
  }, [open, value]);

  const handleConfirm = () => {
    if (selected) onConfirm(selected);
    onOpenChange(false);
  };

  const optionGrid = (
    <div className="grid grid-cols-3 gap-[10px]">
      {options.map((option) => {
        const active = option === selected;

        return (
          <button
            className={cn(
              "text-body-2 flex h-[48px] items-center justify-center rounded-[8px] border transition-colors",
              active
                ? "border-black bg-black font-semibold text-white"
                : "border-black/20 bg-white text-black hover:border-black/40",
            )}
            key={option}
            onClick={() => setSelected(option)}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent className="px-[24px] pb-[24px]">
          <div className="flex flex-col gap-[28px] pt-[20px]">
            <div className="relative flex items-center justify-center">
              <DrawerTitle className="text-title-4 font-bold text-black">
                {title}
              </DrawerTitle>
              <button
                aria-label={t("close")}
                className="absolute right-0 text-black"
                onClick={() => onOpenChange(false)}
                type="button"
              >
                <X className="size-6" />
              </button>
            </div>
            {optionGrid}
            <Button
              className="h-[48px] w-full"
              onClick={handleConfirm}
              type="button"
            >
              {t("confirm")}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="gap-[28px] p-[24px] sm:max-w-[482px]"
        showCloseButton={false}
      >
        <div className="relative flex items-center justify-center">
          <DialogTitle className="text-title-4 font-bold text-black">
            {title}
          </DialogTitle>
          <button
            aria-label={t("close")}
            className="absolute right-0 text-black"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X className="size-6" />
          </button>
        </div>
        {optionGrid}
        <Button
          className="h-[48px] w-full"
          onClick={handleConfirm}
          type="button"
        >
          {t("confirm")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
