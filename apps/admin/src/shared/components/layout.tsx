import { useState, type PropsWithChildren } from "react";

import { Flex } from "@seoul-moment/ui";

import Header from "./header";
import Sidebar from "./sidebar";

export type MenuItem =
  | "dashboard"
  | "users"
  | "user-roles"
  | "user-groups"
  | "products"
  | "categories"
  | "inventory"
  | "orders"
  | "analytics"
  | "settings"
  | "banner"
  | "home-banner"
  | "brand";

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
        <main className="ml-56 flex-1 max-lg:ml-0">{children}</main>
      </Flex>
    </div>
  );
}
