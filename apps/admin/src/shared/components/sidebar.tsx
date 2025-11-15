import { useState, type ReactNode } from "react";

import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import type { MenuItem } from "./layout";

interface SidebarProps {
  selectedMenu?: MenuItem;
  onMenuSelect?(menu: MenuItem): void;
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

export default function Sidebar({ selectedMenu, onMenuSelect }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<MenuItem>>(
    new Set(["users", "products"]),
  );

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

  const toggleMenu = (menuId: MenuItem) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const isMenuExpanded = (menuId: MenuItem) => expandedMenus.has(menuId);

  const isSubItemSelected = (item: MenuItemConfig) => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => subItem.id === selectedMenu);
  };

  return (
    <aside className="fixed bottom-0 left-0 top-16 w-56 overflow-y-auto border-r border-gray-200 bg-white">
      <nav className="space-y-1 p-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors ${
                (selectedMenu === item.id && !item.subItems) ||
                isSubItemSelected(item)
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => {
                if (item.subItems) {
                  toggleMenu(item.id);
                } else {
                  onMenuSelect?.(item.id);
                }
              }}
              type="button"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.subItems && (
                <span>
                  {isMenuExpanded(item.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </button>

            {item.subItems && isMenuExpanded(item.id) && (
              <div className="ml-4 mt-1 space-y-1">
                {item.subItems.map((subItem) => (
                  <button
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm transition-colors ${
                      selectedMenu === subItem.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    key={subItem.id}
                    onClick={() => onMenuSelect?.(subItem.id)}
                    type="button"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{subItem.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
