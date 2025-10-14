"use client";

import { MenuIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import useModal from "@/shared/lib/hooks/useModal";
import { ShareModal } from "@/widgets/share-modal";
import { Search } from "@features/search";
import { cn } from "@shared/lib/style";
import { Button } from "@shared/ui/button";
import Divider from "@shared/ui/divider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/ui/sheet";
import { LanguageSupport } from "@widgets/language-support";

const styleMap = {
  deskTop: {
    menu: "text-[14px] pt-[20px] pb-[20px] transition-all hover:border-b hover:border-b-black hover:font-semibold",
  },
  mobile: {
    menu: "text-[14px] flex justify-between h-[42px] items-center",
  },
};

function Desktop() {
  return (
    <div
      className={cn(
        "mx-auto flex h-full w-full max-w-[1280px] items-center justify-between",
        "max-sm:hidden",
      )}
    >
      <div className="flex items-center gap-[40px]">
        <Link className="h-full" href="/">
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
            <Link className={styleMap.deskTop.menu} href="/product">
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
      <div className="flex items-center-safe gap-[40px]">
        <div>
          <Search>
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
          </Search>
        </div>
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
          <li className="h-[56px] py-[20px] text-[14px]">
            <LanguageSupport />
          </li>
        </ul>
      </div>
    </div>
  );
}

function Mobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "hidden",
        "h-full w-full max-sm:flex max-sm:items-center max-sm:justify-between",
      )}
    >
      <div className="flex items-center gap-[10px]">
        <Sheet onOpenChange={(isOpen) => setIsOpen(isOpen)} open={isOpen}>
          <SheetTrigger asChild>
            <button
              className="cursor-pointer"
              onClick={() => setIsOpen(true)}
              type="button"
            >
              <MenuIcon />
            </button>
          </SheetTrigger>
          <SheetContent
            className="flex w-full px-[20px] sm:max-w-screen"
            side="left"
          >
            <SheetHeader className="ml-[34px] flex min-h-[55px] justify-center px-0 py-0">
              <Image alt="" height={24} src="/logo.png" width={133} />
              <SheetTitle className="sr-only" />
              <SheetDescription className="sr-only" />
            </SheetHeader>
            <div className="flex h-full flex-col justify-between">
              <ul className="flex flex-col">
                <li>
                  <Link
                    className={styleMap.mobile.menu}
                    href="/product"
                    onClick={() => setIsOpen(false)}
                  >
                    Product
                    <ChevronRightIcon height={16} width={16} />
                  </Link>
                </li>
                {/*<li>
                <Link className={styleMap.mobile.menu} href="/brand">
                  Brand
                  <ChevronRightIcon height={16} width={16} />
                </Link>
              </li>
              <li>
                <Link className={styleMap.mobile.menu} href="/magazine">
                  Magazine
                  <ChevronRightIcon height={16} width={16} />
                </Link>
              </li>*/}
                <li>
                  <Link
                    className={styleMap.mobile.menu}
                    href="/about"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                    <ChevronRightIcon height={16} width={16} />
                  </Link>
                </li>
                <li>
                  <Link
                    className={styleMap.mobile.menu}
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                    <ChevronRightIcon height={16} width={16} />
                  </Link>
                </li>
              </ul>
              <div className="flex items-center pb-[33px]">
                <Link href="ko">KOR</Link>
                <Divider className="block bg-black/40" />
                <Link href="en">ENG</Link>
                <Divider className="block bg-black/40" />
                <Link href="zh-TW">繁體中文</Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link className={cn()} href="/">
          <Image alt="" height={16} src="/logo.png" width={133} />
        </Link>
      </div>
      <div className="flex gap-[24px]">
        <Search disableKeyPressOpen>
          <Button className="h-auto w-auto p-0" variant="ghost">
            <SearchIcon height={24} width={24} />
          </Button>
        </Search>
      </div>
    </div>
  );
}

export function Header() {
  const { isOpen, updateModal } = useModal();

  return (
    <>
      <header
        className={cn(
          "h-[56px] w-full bg-white px-[20px]",
          "border-b border-b-black/5",
          "fixed top-0 left-0 z-10",
          "flex items-center",
        )}
      >
        <Desktop />
        <Mobile />
      </header>
      {isOpen && <ShareModal onOpenChange={updateModal} open={true} />}
    </>
  );
}
