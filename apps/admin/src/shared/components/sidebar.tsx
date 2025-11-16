import { type ReactNode } from "react";

import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  cn,
} from "@seoul-moment/ui";

import type { MenuItem } from "./layout";

interface SidebarProps {
  selectedMenu?: MenuItem;
  isMobileMenuOpen: boolean;
  onMenuSelect?(menu: MenuItem): void;
  onMobileMenuClose(): void;
}

interface SubMenuItem {
  id: MenuItem;
  label: string;
}

interface MenuItemConfig {
  id: MenuItem;
  label: string;
  icon: ReactNode;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItemConfig[] = [
  {
    id: "dashboard",
    label: "대시보드",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    id: "users",
    label: "사용자 관리",
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { id: "users", label: "전체 사용자" },
      { id: "user-roles", label: "권한 관리" },
      { id: "user-groups", label: "그룹 관리" },
    ],
  },
  {
    id: "products",
    label: "상품 관리",
    icon: <Package className="h-5 w-5" />,
    subItems: [
      { id: "products", label: "전체 상품" },
      { id: "product-categories", label: "카테고리" },
      { id: "product-inventory", label: "재고 관리" },
    ],
  },
  {
    id: "orders",
    label: "주문 관리",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    id: "analytics",
    label: "분석",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: "settings",
    label: "설정",
    icon: <Settings className="h-5 w-5" />,
  },
];

const defaultExpandedMenus: MenuItem[] = ["users", "products"];

export default function Sidebar({
  isMobileMenuOpen,
  selectedMenu,
  onMobileMenuClose,
  onMenuSelect,
}: SidebarProps) {
  const isSubItemSelected = (item: MenuItemConfig) => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => subItem.id === selectedMenu);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-16 z-40 w-56 overflow-y-auto border-r border-gray-200 bg-white",
          "transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="space-y-1 p-2">
          <Accordion
            className="space-y-1"
            defaultValue={defaultExpandedMenus}
            type="multiple"
          >
            {menuItems.map((item) => {
              const isSelected =
                (selectedMenu === item.id && !item.subItems) ||
                isSubItemSelected(item);

              if (item.subItems) {
                return (
                  <AccordionItem
                    className="border-none"
                    key={item.id}
                    value={item.id}
                  >
                    <AccordionTrigger
                      className={cn(
                        "items-center rounded-lg px-4 py-3 text-sm transition-colors",
                        "text-gray-700 hover:bg-gray-100",
                        isSelected && "bg-gray-900 text-white",
                      )}
                    >
                      <div className="flex flex-1 items-center gap-3 text-left">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-1 pb-0 pt-2">
                      {item.subItems.map((subItem) => (
                        <button
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors",
                            "text-gray-600 hover:bg-gray-50",
                            selectedMenu === subItem.id &&
                              "bg-gray-100 text-gray-900",
                          )}
                          key={subItem.id}
                          onClick={() => onMenuSelect?.(subItem.id)}
                          type="button"
                        >
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                );
              }

              return (
                <button
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors ${
                    isSelected
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  key={item.id}
                  onClick={() => onMenuSelect?.(item.id)}
                  type="button"
                >
                  <div className="text-body-3 flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </Accordion>
        </nav>
      </aside>
    </>
  );
}
