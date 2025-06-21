import { MenuIcon } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/style";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

const styleMap = {
  deskTop: {
    menu: "py-[20px]",
  },
  mobile: {
    menu: "flex h-[40px] items-center px-[20px]",
  },
};

function Desktop() {
  return (
    <div
      className={cn(
        "mx-auto flex h-full w-full max-w-[1920px] items-center justify-between",
        "max-md:hidden",
      )}
    >
      <div className="flex items-center gap-[40px]">
        <Link className="h-full" href="/">
          <Image
            alt=""
            className="h-full"
            height={80}
            src="/logo.png"
            width={120}
          />
        </Link>
        <ul className="flex gap-[40px]">
          <li>
            <Link className={styleMap.deskTop.menu} href="/product">
              Product
            </Link>
          </li>
          <li>
            <Link className={styleMap.deskTop.menu} href="/brand">
              Brand
            </Link>
          </li>
          <li>
            <Link className={styleMap.deskTop.menu} href="/news">
              News
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <ul className="flex items-center gap-[40px]">
          <li>
            <Link className={styleMap.deskTop.menu} href="/about">
              About
            </Link>
          </li>
          <li>
            <Link className={styleMap.deskTop.menu} href="/contact">
              Contact
            </Link>
          </li>
          <li>KR</li>
        </ul>
      </div>
    </div>
  );
}

function Mobile() {
  return (
    <div className={cn("hidden", "max-md:flex")}>
      <Sheet>
        <SheetTrigger asChild>
          <button className="cursor-pointer" type="button">
            <MenuIcon />
          </button>
        </SheetTrigger>
        <SheetContent hideClose side="left">
          <SheetHeader>
            <SheetTitle className="sr-only" />
            <SheetDescription className="sr-only" />
          </SheetHeader>
          <ul className="flex flex-col">
            <li>
              <Link className={styleMap.mobile.menu} href="/product">
                Product
              </Link>
            </li>
            <li>
              <Link className={styleMap.mobile.menu} href="/brand">
                Brand
              </Link>
            </li>
            <li>
              <Link className={styleMap.mobile.menu} href="/news">
                News
              </Link>
            </li>
            <li>
              <Link className={styleMap.mobile.menu} href="/about">
                About
              </Link>
            </li>
            <li>
              <Link className={styleMap.mobile.menu} href="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function Header() {
  return (
    <header
      className={cn(
        "h-[60px] w-full bg-white px-[20px]",
        "fixed top-0 left-0",
        "flex items-center text-[20px]",
        "max-md:h-[50px]",
      )}
    >
      <Desktop />
      <Mobile />
    </header>
  );
}
