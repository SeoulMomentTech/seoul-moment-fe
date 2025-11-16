import { useState, type FormEvent } from "react";

import { Link, useNavigate } from "react-router";

import { Lock } from "lucide-react";

import { PATH } from "@shared/constants/route";
import { useAuthStore } from "@shared/hooks/useAuth";

import {
  Button,
  Label,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@seoul-moment/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (!email.includes("@")) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    if (email !== "admin@seoulmoment.com.tw") {
      setError("계정이 존재하지 않습니다.");
      return;
    }

    login({
      accessToken: "temporary-token",
      user: {
        id: Date.now(),
        email,
        name: email.split("@")[0] ?? "관리자",
      },
    });

    navigate(PATH.INDEX, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle>어드민 로그인</CardTitle>
            <CardDescription>관리자 계정으로 로그인하세요</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button className="w-full" type="submit">
              로그인
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{" "}
              <Link className="text-gray-900 hover:underline" to="/signup">
                회원가입
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
