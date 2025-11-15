import type { User } from "lucide-react";

import { Avatar, AvatarFallback, Button } from "@seoul-moment/ui";

interface User {
  id: string;
  email: string;
  name: string;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-sm">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </Button>
          <Button size="sm">로그아웃</Button>
        </div>
      </div>
    </header>
  );
}
