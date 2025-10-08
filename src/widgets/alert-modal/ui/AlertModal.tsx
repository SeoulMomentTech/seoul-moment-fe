import type { PropsWithChildren } from "react";

import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";

interface AlertModalProps extends PropsWithChildren {
  open?: boolean;
  onOpenChange(open: boolean): void;
  onClickOK(): void;
}

export default function AlertModal({
  children,
  open,
  onOpenChange,
  onClickOK,
}: AlertModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTitle />
      <DialogContent
        className="w-[300px] px-[32px] pt-[40px] pb-[32px]"
        showCloseButton={false}
      >
        <div className="flex flex-col gap-[32px]">
          {children}
          <Button
            className="px-[20px] py-[16px] font-semibold"
            onClick={onClickOK}
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
