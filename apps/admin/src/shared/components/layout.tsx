import { useState, type PropsWithChildren } from "react";

import { Flex } from "@seoul-moment/ui";

import Header from "./header";
import Sidebar from "./sidebar";

export type MenuItem =
  | "dashboard"
  | "members"
  | "users"
  | "user-roles"
  | "user-groups"
  | "products"
  | "product-master"
  | "categories"
  | "product-categories"
  | "inventory"
  | "orders"
  | "analytics"
  | "settings"
  | "banner"
  | "home-banner"
  | "product-banner"
  | "brand"
  | "brand-promotion"
  | "product-options"
  | "article"
  | "article-add"
  | "article-edit"
  | "news"
  | "news-add"
  | "news-edit"
  | "news-category"
  | "news-hashtag"
  | "promotion"
  | "promotion-add"
  | "promotion-edit";

export function Layout({ children }: PropsWithChildren) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <Flex className="flex">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
        {/* min-w-0: flex 아이템 기본값(min-width:auto)이면 넓은 테이블이 main 을
            늘려 페이지 전체가 가로로 넘친다. 스크롤은 테이블이 스스로 가진다. */}
        <main className="ml-56 min-w-0 flex-1 max-lg:ml-0">{children}</main>
      </Flex>
    </div>
  );
}
