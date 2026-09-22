import { Suspense } from "react";

import { LoginPage } from "@/views/login";

export default function Login() {
  // 로그인은 돌아올 곳을 `?redirect=` 에서 읽는다(`LoginPage` → nuqs). URL 훅은 정적
  // 프리렌더에서 경계 없이 쓸 수 없어 빌드가 멈춘다(`/order` 의 `?items=` 와 같은 이유).
  //
  // fallback 이 `null` 인 것은 화면이 이미 그렇게 동작하기 때문이다 — `GuestOnly` 가
  // hydration 전까지 아무것도 그리지 않으므로, 스켈레톤을 두면 여기서만 잠깐 보였다가
  // 다시 빈 화면으로 돌아간다.
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
