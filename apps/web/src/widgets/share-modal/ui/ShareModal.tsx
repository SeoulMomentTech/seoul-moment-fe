import { LinkIcon } from "lucide-react";
import { toast } from "sonner";

import useCopyToClipBoard from "@shared/lib/hooks/useCopyToClipboard";
import useModal from "@shared/lib/hooks/useModal";

import { Dialog, DialogContent, DialogTitle } from "@seoul-moment/ui";

interface ShareModalProps {
  open?: boolean;
  onOpenChange(open: boolean): void;
}

export default function ShareModal({ open, onOpenChange }: ShareModalProps) {
  const { copy } = useCopyToClipBoard();
  const { modalType } = useModal();
  const isOpen = open && modalType === "share";

  const handleCopyLink = async () => {
    const link = location.href;
    await copy(link);
    toast.success("URL Copied");
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogTitle />
      <DialogContent className="h-[308px] w-[325px] px-[40px] pb-[40px] pt-[32px]">
        <div className="flex flex-col gap-[32px]">
          <h2 className="text-title-4 text-center">공유하기</h2>
          <div className="flex gap-x-[16px] gap-y-[24px]">
            <button
              className="flex cursor-pointer flex-col gap-[8px]"
              onClick={handleCopyLink}
              type="button"
            >
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-black/10">
                <LinkIcon height={24} width={24} />
              </div>
              <span>링크복사</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
