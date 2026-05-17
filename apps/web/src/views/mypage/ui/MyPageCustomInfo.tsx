"use client";

import AuthOnly from "@shared/lib/components/AuthOnly";

import { CustomInfoSection } from "@features/mypage";
import { MyPageSidebar } from "@widgets/mypage-sidebar";

export function MyPageCustomInfo() {
  return (
    <AuthOnly>
      <div className="mx-auto mt-[50px] flex w-full max-w-7xl gap-5 pb-[100px] pt-[60px] max-sm:mt-[50px] max-sm:flex-col max-sm:gap-[30px] max-sm:pb-[40px] max-sm:pt-[20px]">
        <MyPageSidebar className="w-[305px] shrink-0 max-sm:hidden" />
        <div className="flex min-w-[955px] flex-1 flex-col gap-10 max-sm:min-w-full max-sm:gap-[30px] max-sm:px-[20px]">
          <CustomInfoSection />
        </div>
      </div>
    </AuthOnly>
  );
}
