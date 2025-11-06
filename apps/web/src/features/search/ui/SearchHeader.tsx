import { SearchIcon } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@shared/lib/style";
import { Button } from "@shared/ui/button";
import { LanguageSupport } from "@widgets/language-support";

interface SearchHeaderProps {
  handleClose(): void;
}

const styleMap = {
  menu: "text-[14px] pt-[20px] pb-[20px] transition-all hover:border-b hover:border-b-black hover:font-semibold",
};

function SearchHeader({ handleClose }: SearchHeaderProps) {
  return (
    <div className="max-sm:hidden">
      <div
        className={cn(
          "relative mx-auto flex h-full w-full max-w-[1280px] items-center justify-between",
        )}
      >
        <div className="flex items-center gap-[40px]">
          <Link className="h-full" href="/" onClick={handleClose}>
            <Image
              alt=""
              className="h-full"
              height={24}
              src="/logo.png"
              width={200}
            />
          </Link>
          <ul className="flex gap-[40px]">
            <li>
              <Link
                className={styleMap.menu}
                href="/product"
                onClick={handleClose}
              >
                Product
              </Link>
            </li>
            {/*<li>
    <Link className={styleMap.deskTop.menu} href="/brand">
      Brand
    </Link>
  </li>*/}
            {/*<li>
    <Link className={styleMap.deskTop.menu} href="/magazine">
      Magazine
    </Link>
  </li>*/}
          </ul>
        </div>
        <div className="items-center-safe flex gap-[40px]">
          <div>
            <Button
              className="h-[32px] min-w-[100px] justify-start px-[10px]"
              variant="outline"
            >
              <SearchIcon className="mr-[10px]" height={16} width={16} />
              <div className="mr-[4px] flex aspect-square w-[20px] items-center justify-center rounded-[5px] bg-black/20">
                <span className="text-foreground text-body-5">/</span>
              </div>
              <span className="text-body-3">를 눌러 검색하세요</span>
            </Button>
          </div>
          <ul className="flex items-center gap-[40px]">
            <li>
              <Link
                className={styleMap.menu}
                href="/about"
                onClick={handleClose}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className={styleMap.menu}
                href="/contact"
                onClick={handleClose}
              >
                Contact
              </Link>
            </li>
            <li className="h-[56px] py-[20px] text-[14px]">
              <LanguageSupport />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SearchHeader;
