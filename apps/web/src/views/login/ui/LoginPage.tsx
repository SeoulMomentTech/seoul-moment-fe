"use client";

import { parseAsString, useQueryState } from "nuqs";

import GuestOnly from "@shared/lib/components/GuestOnly";
import { resolveRedirectPath } from "@shared/lib/utils/redirectPath";

import {
  LoginForm,
  LoginHeader,
  LoginTerms,
  Register,
  SocialLoginButtons,
} from "@features/login";
import { VStack } from "@seoul-moment/ui";

export function LoginPage() {
  // 장바구니의 `주문하기` 처럼 돌아올 곳을 들고 로그인으로 오는 진입점이 있다. URL 값은
  // 신뢰 경계 밖이라 `resolveRedirectPath` 가 내부 경로인지 다시 검증한 값만 넘긴다.
  const [redirect] = useQueryState("redirect", parseAsString);

  return (
    <GuestOnly redirectTo={resolveRedirectPath(redirect)}>
      <VStack className="w-full px-4 pb-[122px] pt-[136px] max-md:pb-[50px] max-md:pt-[106px]">
        <VStack className="w-full max-w-[414px]">
          <LoginHeader />
          <LoginForm />
          <LoginTerms />
          <SocialLoginButtons />
          <Register />
        </VStack>
      </VStack>
    </GuestOnly>
  );
}
