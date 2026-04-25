import type { PropsWithChildren, ReactElement } from "react";

import { Drawer, DrawerContent, DrawerTrigger } from "@seoul-moment/ui";

interface BottomSheetProps extends PropsWithChildren {
  open?: boolean;
  onOpenChange?(open: boolean): void;
  trigger: ReactElement;
}

export function BottomSheet({
  open,
  onOpenChange,
  trigger,
  children,
}: BottomSheetProps) {
  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
