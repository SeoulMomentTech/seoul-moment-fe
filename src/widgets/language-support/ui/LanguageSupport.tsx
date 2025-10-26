"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@shared/lib/style";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@shared/ui/dropdown-menu";

type LanguageCode = keyof typeof locales;

const locales = {
  ko: "KOR",
  en: "ENG",
  "zh-TW": "繁體中文",
};

export default function LanguageSupport() {
  const currentLocale = useLocale() as LanguageCode;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex min-w-[66px] items-center justify-between px-[10px] text-start",
            "rounded-[8px] text-[14px]",
            "cursor-pointer max-md:min-w-[120px]",
          )}
          type="button"
        >
          {locales[currentLocale]}
          <ChevronDown height={16} width={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[66px] bg-white text-[14px] focus:ring-transparent! max-md:min-w-[120px]"
        side="top"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link className="w-full" href="/ko">
              KOR
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="w-full" href="/en">
              ENG
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="w-full" href="/zh-TW">
              繁體中文
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
