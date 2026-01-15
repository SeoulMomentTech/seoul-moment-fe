import { useTranslations } from "next-intl";

import { FilterIcon } from "@shared/ui/icon";

import { Button } from "@seoul-moment/ui";

interface OptionFilterProps {
  onClick(): void;
}

export default function OptionFilter({ onClick }: OptionFilterProps) {
  const t = useTranslations();
  return (
    <Button
      className="flex h-full gap-[4px] p-0 hover:bg-transparent"
      onClick={onClick}
      size="sm"
      variant="ghost"
    >
      <FilterIcon />
      {t("select_filter")}
    </Button>
  );
}
