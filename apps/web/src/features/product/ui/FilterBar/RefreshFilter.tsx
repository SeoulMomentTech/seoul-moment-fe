import { RefreshIcon } from "@shared/ui/icon";

import { Button } from "@seoul-moment/ui";

interface RefreshFilterProps {
  onReset(): void;
}

export default function RefreshFilter({ onReset }: RefreshFilterProps) {
  return (
    <Button
      className="flex h-full items-center gap-[4px] p-0 hover:bg-transparent"
      onClick={onReset}
      size="sm"
      variant="ghost"
    >
      <RefreshIcon height={18} width={18} />
      초기화
    </Button>
  );
}
