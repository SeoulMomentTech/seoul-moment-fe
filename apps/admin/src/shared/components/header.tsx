import { useNavigate } from "react-router";

import { Menu } from "lucide-react";

import { PATH } from "@shared/constants/route";
import { useAuth } from "@shared/hooks/useAuth";

import { Avatar, AvatarFallback, Button, cn, HStack } from "@seoul-moment/ui";

interface HeaderProps {
  onMenuToggle(): void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    navigate(PATH.LOGIN, { replace: true });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-gray-200 bg-white">
      <HStack
        align="between"
        className={cn("h-full justify-between px-6", "max-lg:px-3")}
      >
        <HStack gap={16}>
          <Button
            className="px-2 lg:hidden"
            onClick={onMenuToggle}
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-gray-900">Admin Dashboard</h1>
        </HStack>

        <HStack gap={16}>
          <Button
            className={cn("flex items-center", "max-lg:px-0")}
            variant="ghost"
          >
            <Avatar className={cn("mr-[8px] h-8 w-8", "max-lg:mr-0")}>
              <AvatarFallback className="bg-gray-900 text-white">
                {getInitials(user?.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="text-left max-lg:hidden">
              <div className="text-sm">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </Button>
          <Button onClick={handleLogout} size="sm">
            로그아웃
          </Button>
        </HStack>
      </HStack>
    </header>
  );
}
