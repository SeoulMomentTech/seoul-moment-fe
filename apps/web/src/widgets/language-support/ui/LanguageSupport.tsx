"use client";

import { ChevronDown } from "lucide-react";

import { useLocale } from "next-intl";

import { cn } from "@shared/lib/style";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui/dropdown-menu";

import { localeLabels, type LanguageType } from "@/i18n/const";
import { Link, usePathname } from "@/i18n/navigation";

export default function LanguageSupport() {
  const currentLocale = useLocale() as LanguageType;
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex min-w-[66px] items-center justify-between px-[10px] text-start",
            "text-body-3 rounded-[8px]",
            "cursor-pointer max-md:min-w-[120px]",
          )}
          type="button"
        >
          {localeLabels[currentLocale]}
          <ChevronDown height={16} width={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="focus:ring-transparent! text-body-3 min-w-[66px] bg-white max-md:min-w-[120px]"
        side="top"
      >
        <DropdownMenuGroup>
          {Object.entries(localeLabels).map(([code, label]) => (
            <DropdownMenuItem key={code}>
              <Link
                className="w-full"
                href={pathname}
                locale={code as LanguageType}
              >
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
