import { cn } from "@/shared/lib/style";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface ProductFilterModalProps {
  isOpen: boolean;
  handleIsOpen(open: boolean): void;
}

export default function ProductFilterModal({
  isOpen,
  handleIsOpen,
}: ProductFilterModalProps) {
  const handleApplyFilter = () => {
    handleIsOpen(false);
  };

  const handleCloseFilter = () => {
    handleIsOpen(false);
  };

  return (
    <Dialog onOpenChange={handleIsOpen} open={isOpen}>
      <DialogContent className="w-[522px] pt-[32px]">
        <DialogHeader>
          <DialogTitle className="text-title-4 text-center font-semibold">
            필터
          </DialogTitle>
          <DialogDescription className="sr-only" />
        </DialogHeader>
        <div className="relative flex flex-col gap-[32px]">
          <div className="min-h-[300px]" />
          <div className={cn("flex justify-center gap-[8px] px-[20px]")}>
            <Button
              className="flex-1"
              onClick={handleCloseFilter}
              variant="outline"
            >
              닫기
            </Button>
            <Button className="flex-1" onClick={handleApplyFilter}>
              적용하기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
