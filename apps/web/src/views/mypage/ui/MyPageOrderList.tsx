"use client";

import AuthOnly from "@shared/lib/components/AuthOnly";

import { OrderList } from "@features/order";
import { MyPageBackLink, MyPageSidebar } from "@widgets/mypage-sidebar";

/** 마이페이지 레이아웃(사이드바 + 본문) 안의 주문내역 */
export function MyPageOrderList() {
  return (
    <AuthOnly>
      <div className="mx-auto mt-[50px] flex w-full max-w-7xl gap-5 pb-[100px] pt-[60px] max-sm:mt-[50px] max-sm:flex-col max-sm:gap-[30px] max-sm:pb-[40px] max-sm:pt-[20px]">
        <MyPageSidebar className="w-[305px] shrink-0 max-sm:hidden" />
        <div className="min-w-0 flex-1 max-sm:px-[20px]">
          <MyPageBackLink className="mb-4" href="/mypage" />
          <OrderList />
        </div>
      </div>
    </AuthOnly>
  );
}
