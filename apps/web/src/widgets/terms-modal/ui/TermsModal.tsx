"use client";

import type { PropsWithChildren } from "react";

import { ChevronLeftIcon, XIcon } from "lucide-react";

import {
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  HStack,
  VStack,
} from "@seoul-moment/ui";

interface TermsModalProps extends PropsWithChildren {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
}

export function TermsModal({
  open,
  onOpenChange,
  title,
  children,
}: TermsModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          "gap-0 border-0 bg-white p-0 shadow-[0px_2px_10px_rgba(0,0,0,0.04)]",
          "sm:w-[630px] sm:max-w-[630px] sm:rounded-[8px]",
          "max-sm:left-0 max-sm:top-0 max-sm:h-screen max-sm:w-screen",
          "max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0",
          "max-sm:rounded-none",
          "max-sm:data-[state=open]:slide-in-from-bottom",
          "max-sm:data-[state=open]:[--tw-enter-scale:1]",
          "max-sm:data-[state=open]:[--tw-enter-opacity:1]",
          "max-sm:data-[state=closed]:slide-out-to-bottom",
          "max-sm:data-[state=closed]:[--tw-exit-scale:1]",
          "max-sm:data-[state=closed]:[--tw-exit-opacity:1]",
        )}
        showCloseButton={false}
      >
        <VStack className="h-full w-full" gap={0}>
          <header
            className={cn(
              "relative w-full",
              "sm:px-[24px] sm:pt-[32px]",
              "max-sm:h-14 max-sm:px-[20px]",
            )}
          >
            <DialogClose
              aria-label="Back"
              className="absolute left-[20px] top-1/2 -translate-y-1/2 cursor-pointer outline-none sm:hidden"
            >
              <ChevronLeftIcon size={24} />
            </DialogClose>

            <HStack align="center" className="h-full w-full">
              <DialogTitle
                className={cn(
                  "text-foreground text-title-4 font-semibold leading-none",
                  "max-sm:text-body-2 max-sm:w-full max-sm:pl-[28px] max-sm:text-left",
                )}
              >
                {title}
              </DialogTitle>
            </HStack>

            <DialogClose
              aria-label="Close"
              className={cn(
                "absolute right-[24px] top-[32px] cursor-pointer outline-none",
                "max-sm:hidden",
              )}
            >
              <XIcon size={24} />
            </DialogClose>
          </header>

          <div
            className={cn(
              "w-full overflow-y-auto",
              "sm:h-[600px] sm:px-[24px] sm:pb-[24px] sm:pt-[32px]",
              "max-sm:flex-1 max-sm:px-[20px] max-sm:pb-[20px] max-sm:pt-[20px]",
            )}
          >
            {children}
          </div>
        </VStack>
      </DialogContent>
    </Dialog>
  );
}
