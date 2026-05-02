"use client";

import GuestOnly from "@shared/lib/components/GuestOnly";

import {
  LoginPrompt,
  SignupForm,
  SignupHeader,
  SignupTerms,
} from "@features/signup";
import { VStack } from "@seoul-moment/ui";

export function SignupPage() {
  return (
    <GuestOnly>
      <VStack className="w-full px-4 pb-[122px] pt-[136px] max-md:pb-[50px] max-md:pt-[106px]">
        <VStack className="w-full max-w-[414px]">
          <SignupHeader />
          <SignupForm />
          <SignupTerms />
          <LoginPrompt />
        </VStack>
      </VStack>
    </GuestOnly>
  );
}
