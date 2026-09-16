import type { AdminMemberId } from "@shared/services/member";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@seoul-moment/ui";

import { MemberCartPanel } from "./MemberCartPanel";
import { MemberLikePanel } from "./MemberLikePanel";
import { MemberOrderPanel } from "./MemberOrderPanel";
import { MemberRecentPanel } from "./MemberRecentPanel";

/** 웹 서비스용 기본 탭은 18px 라 어드민 밀도에 맞춰 낮춘다 */
const TRIGGER_CLASS = "h-auto flex-none px-4 py-2.5 text-sm max-sm:text-sm";

export function MemberActivityTabs({ memberId }: { memberId: AdminMemberId }) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Tabs className="gap-0" defaultValue="order">
        <TabsList className="h-auto w-full justify-start rounded-none border-b border-gray-200 bg-white px-2">
          <TabsTrigger className={TRIGGER_CLASS} value="order">
            주문 내역
          </TabsTrigger>
          <TabsTrigger className={TRIGGER_CLASS} value="cart">
            장바구니
          </TabsTrigger>
          <TabsTrigger className={TRIGGER_CLASS} value="like">
            좋아요
          </TabsTrigger>
          <TabsTrigger className={TRIGGER_CLASS} value="recent">
            최근 본 상품
          </TabsTrigger>
        </TabsList>

        <TabsContent value="order">
          <MemberOrderPanel memberId={memberId} />
        </TabsContent>
        <TabsContent value="cart">
          <MemberCartPanel memberId={memberId} />
        </TabsContent>
        <TabsContent value="like">
          <MemberLikePanel memberId={memberId} />
        </TabsContent>
        <TabsContent value="recent">
          <MemberRecentPanel memberId={memberId} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
