"use client";

import { useTranslations } from "next-intl";

import type { UserOrderShippingType } from "@shared/services/userOrder";

import { Tabs, TabsList, TabsTrigger } from "@seoul-moment/ui";

interface OrderShippingMethodTabsProps {
  value: UserOrderShippingType;
  onChange(next: UserOrderShippingType): void;
}

/**
 * 택배 / 편의점 픽업 전환. 패널은 섹션이 직접 분기하므로 여기서는 탭 머리만 그린다 —
 * 두 패널이 서로 다른 폼을 들고 있어 `TabsContent` 로 묶으면 값이 섞인다.
 */
export function OrderShippingMethodTabs({
  value,
  onChange,
}: OrderShippingMethodTabsProps) {
  const t = useTranslations();

  return (
    <Tabs
      className="mb-4"
      onValueChange={(next) => onChange(next as UserOrderShippingType)}
      value={value}
    >
      <TabsList className="h-11 w-full rounded-none border-b border-black/10 bg-transparent">
        <TabsTrigger className="h-full" value="HOME">
          {t("shipping_method_home")}
        </TabsTrigger>
        <TabsTrigger className="h-full" value="CVS">
          {t("shipping_method_cvs")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
