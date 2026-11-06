"use client";

import AuthOnly from "@shared/lib/components/AuthOnly";

import { OrderDetail } from "@features/order";
import { MyPageSidebar } from "@widgets/mypage-sidebar";

interface MyPageOrderDetailProps {
  orderId: number;
}

/** 마이페이지 레이아웃(사이드바 + 본문) 안의 주문 상세 */
export function MyPageOrderDetail({ orderId }: MyPageOrderDetailProps) {
  return (
    <AuthOnly>
      <div className="mx-auto mt-[50px] flex w-full max-w-7xl gap-5 pb-[100px] pt-[60px] max-sm:mt-[50px] max-sm:flex-col max-sm:gap-[30px] max-sm:pb-[40px] max-sm:pt-[20px]">
        <MyPageSidebar className="w-[305px] shrink-0 max-sm:hidden" />
        <div className="min-w-0 flex-1 max-sm:px-[20px]">
          <OrderDetail orderId={orderId} />
        </div>
      </div>
    </AuthOnly>
  );
}
