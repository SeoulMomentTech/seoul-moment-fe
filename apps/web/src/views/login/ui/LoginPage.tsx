"use client";

import GuestOnly from "@shared/lib/components/GuestOnly";

import {
  LoginForm,
  LoginHeader,
  LoginTerms,
  Register,
  SocialLoginButtons,
} from "@features/login";
import { VStack } from "@seoul-moment/ui";

export function LoginPage() {
  return (
    <GuestOnly>
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
