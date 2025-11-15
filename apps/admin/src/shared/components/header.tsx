import { useNavigate } from "react-router";

import { PATH } from "@/shared/constants/route";
import { useAuth } from "@/shared/hooks/useAuth";

import { Avatar, AvatarFallback, Button } from "@seoul-moment/ui";

export default function Header() {
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
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center">
          <h1 className="text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button className="flex items-center" variant="ghost">
            <Avatar className="mr-[8px] h-8 w-8">
              <AvatarFallback className="bg-gray-900 text-white">
                {getInitials(user?.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-sm">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </Button>
          <Button onClick={handleLogout} size="sm">
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  );
}
