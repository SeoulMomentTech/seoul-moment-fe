import { useState, type PropsWithChildren } from "react";

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
  | "settings";

export function Layout({ children }: PropsWithChildren) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
        <main className="ml-56 flex-1 max-lg:ml-0">{children}</main>
      </div>
    </div>
  );
}
