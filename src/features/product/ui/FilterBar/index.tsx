import { Button } from "@shared/ui/button";
import Divider from "@shared/ui/divider";
import { RefreshIcon } from "@shared/ui/icon";
import OptionFilter from "./OptionFilter";
import SortFilter from "./SortFilter";

export default function Filters() {
  return (
    <div className="flex items-center">
      <SortFilter />
      <Divider className="block bg-black/40" />
      <OptionFilter />
      <Divider className="block bg-black/40" />
      <Button
        className="flex h-full items-center gap-[4px] p-0 hover:bg-transparent"
        size="sm"
        variant="ghost"
      >
        <RefreshIcon height={18} width={18} />
        초기화
      </Button>
    </div>
  );
}
