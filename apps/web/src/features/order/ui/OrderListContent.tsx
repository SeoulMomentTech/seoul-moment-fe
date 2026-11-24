import { PackageIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import type { UserOrderListStatusFilter } from "@shared/services/userOrder";
import { Empty } from "@shared/ui/empty";

import { Link } from "@/i18n/navigation";

import { useUserOrderListInfiniteQuery } from "@entities/order";
import { Button, Skeleton } from "@seoul-moment/ui";

import { OrderListCard } from "./OrderListCard";

/** 빈 상태·오류 영역 높이. 목록이 비어도 화면이 휑하지 않게 세로로 넉넉히 잡는다 */
const EMPTY_CLASS = "py-[120px] max-sm:py-[80px]";

const SKELETON_KEYS = ["order-1", "order-2", "order-3"];

const EMPTY_ICON = (
  <PackageIcon aria-hidden className="size-10 text-black/20" />
);

function OrderListSkeleton() {
  return (
    <ul aria-busy className="grid gap-3">
      {SKELETON_KEYS.map((key) => (
        <li className="flex gap-4 border border-black/10 p-5" key={key}>
          <Skeleton className="size-20 shrink-0" />
          <div className="grid flex-1 content-start gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function OrderListError() {
  const t = useTranslations();

  return (
    <Empty
      className={EMPTY_CLASS}
      description={t("order_list_error")}
      icon={EMPTY_ICON}
    />
  );
}

/** 관심 탭과 같은 빈 상태. 목록 폭을 다 쓰고 세로 여백으로 영역을 잡는다 */
function OrderListEmpty() {
  const t = useTranslations();

  return (
    <div className={`${EMPTY_CLASS} flex flex-col items-center gap-6`}>
      <Empty description={t("order_list_empty")} icon={EMPTY_ICON} />
      <Button asChild className="h-11 min-w-40" variant="outline">
        <Link href="/">{t("payment_continue_shopping")}</Link>
      </Button>
    </div>
  );
}

interface OrderListContentProps {
  status: UserOrderListStatusFilter;
  /** 최근 N개월. null 이면 전체 기간 */
  months: number | null;
}

/** 필터에 맞는 주문 목록. 로딩·오류·빈 상태를 먼저 걸러내고 남은 경우만 목록을 그린다 */
export function OrderListContent({ status, months }: OrderListContentProps) {
  const t = useTranslations();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserOrderListInfiniteQuery({ status, months: months ?? undefined });

  if (isLoading) return <OrderListSkeleton />;
  if (isError || !data) return <OrderListError />;
  if (data.list.length === 0) return <OrderListEmpty />;

  return (
    <>
      <ul className="grid gap-3">
        {data.list.map((order) => (
          <OrderListCard key={order.orderId} order={order} />
        ))}
      </ul>

      {hasNextPage && (
        <Button
          className="mx-auto h-11 min-w-40"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          variant="outline"
        >
          {t("more")}
        </Button>
      )}
    </>
  );
}
