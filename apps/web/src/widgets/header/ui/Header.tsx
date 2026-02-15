"use client";

import { lazy, useState, Fragment } from "react";

import { MenuIcon, ChevronRightIcon } from "lucide-react";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { useModal } from "@shared/lib/hooks";
import { cn } from "@shared/lib/style";
import Divider from "@shared/ui/divider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shared/ui/sheet";

import { localeLabels, type LanguageType } from "@/i18n/const";
import { Link, usePathname } from "@/i18n/navigation";

import { LanguageSupport } from "@widgets/language-support";

import { BrandMenuModal } from "./BrandMenuModal";

const ShareModal = lazy(() =>
  import("@widgets/share-modal").then((module) => ({
    default: module.ShareModal,
  })),
);

const styleMap = {
  deskTop: {
    menu: "text-[14px] pt-[20px] pb-[20px]",
  },
  mobile: {
    menu: "text-[14px] flex justify-between h-[42px] items-center",
  },
};

const ENABLE_HEADER_PREFETCH = true;

function Desktop() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div
      className={cn(
        "mx-auto flex h-full w-full max-w-[1280px] items-center justify-between",
        "max-sm:hidden",
      )}
    >
      <div className="flex items-center gap-[40px]">
        <Link className="h-full" href="/" prefetch={ENABLE_HEADER_PREFETCH}>
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
              className={cn(
                styleMap.deskTop.menu,
                pathname === "/product" && "font-semibold",
              )}
              href="/product"
              prefetch={ENABLE_HEADER_PREFETCH}
            >
              {t("product")}
            </Link>
          </li>
        </ul>
      </div>
      <div className="items-center-safe flex gap-[40px]">
        <ul className="flex items-center gap-[40px]">
          <li>
            <Link
              className={cn(
                styleMap.deskTop.menu,
                pathname === "/about" && "font-semibold",
              )}
              href="/about"
              prefetch={ENABLE_HEADER_PREFETCH}
            >
              {t("about")}
            </Link>
          </li>
          <li>
            <Link
              className={cn(
                styleMap.deskTop.menu,
                pathname === "/contact" && "font-semibold",
              )}
              href="/contact"
              prefetch={ENABLE_HEADER_PREFETCH}
            >
              {t("contact")}
            </Link>
          </li>
          <li className="text-body-3 h-[56px] py-[20px]">
            <LanguageSupport />
          </li>
        </ul>
      </div>
    </div>
  );
}

function Mobile() {
  const [isOpen, setIsOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();

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
            <button className="cursor-pointer" type="button">
              <MenuIcon />
            </button>
          </SheetTrigger>
          <SheetContent
            animate={false}
            className={cn("sm:max-w-screen flex w-full px-[20px]")}
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
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    prefetch={ENABLE_HEADER_PREFETCH}
                  >
                    {t("product")}
                    <ChevronRightIcon height={16} width={16} />
                  </Link>
                </li>
                <li>
                  <button
                    className={cn(styleMap.mobile.menu, "w-full")}
                    onClick={() => {
                      setIsOpen(false);
                      setIsBrandModalOpen(true);
                    }}
                    type="button"
                  >
                    {t("brand")}
                    <ChevronRightIcon height={16} width={16} />
                  </button>
                </li>
                <li>
                  <Link
                    className={styleMap.mobile.menu}
                    href="/about"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    prefetch={ENABLE_HEADER_PREFETCH}
                  >
                    {t("about")}
                    <ChevronRightIcon height={16} width={16} />
                  </Link>
                </li>
                <li>
                  <Link
                    className={styleMap.mobile.menu}
                    href="/contact"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                    prefetch={ENABLE_HEADER_PREFETCH}
                  >
                    {t("contact")}
                    <ChevronRightIcon height={16} width={16} />
                  </Link>
                </li>
              </ul>
              <div className="flex items-center pb-[33px]">
                {Object.entries(localeLabels).map(
                  ([code, label], index, array) => (
                    <Fragment key={code}>
                      <Link
                        href={pathname}
                        locale={code as LanguageType}
                        prefetch={ENABLE_HEADER_PREFETCH}
                      >
                        {label}
                      </Link>
                      {index < array.length - 1 && (
                        <Divider className="block bg-black/40" />
                      )}
                    </Fragment>
                  ),
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link className={cn()} href="/" prefetch={ENABLE_HEADER_PREFETCH}>
          <Image alt="" height={16} src="/logo.png" width={133} />
        </Link>
      </div>
      <BrandMenuModal
        isOpen={isBrandModalOpen}
        onOpenChange={setIsBrandModalOpen}
      />
    </div>
  );
}

export function Header() {
  const { isOpen, updateModal } = useModal();

  return (
    <>
      <header
        className={cn(
          "h-[56px] w-screen min-w-[1280px] bg-white px-[20px]",
          "border-b border-b-black/5",
          "fixed left-0 top-0 z-10",
          "flex items-center",
          "max-sm:min-w-auto",
        )}
      >
        <Desktop />
        <Mobile />
      </header>
      {isOpen && <ShareModal onOpenChange={updateModal} open={true} />}
    </>
  );
}
