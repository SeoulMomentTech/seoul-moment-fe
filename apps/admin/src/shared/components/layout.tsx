import type { PropsWithChildren } from "react";

import Header from "./header";
import Sidebar from "./sidebar";

export type MenuItem =
  | "dashboard"
  | "users"
  | "user-roles"
  | "user-groups"
  | "products"
  | "product-categories"
  | "product-inventory"
  | "orders"
  | "analytics"
  | "settings";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={{
          id: "1",
          email: "admin@admin.com",
          name: "admin",
        }}
      />
      <div className="flex">
        <Sidebar />
        <main className="ml-56 flex-1">{children}</main>
      </div>
    </div>
  );
}
