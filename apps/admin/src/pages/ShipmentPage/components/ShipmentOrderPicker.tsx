import { useId, useState, type KeyboardEvent } from "react";

import { Search } from "lucide-react";

import { orderQueryKeys } from "@pages/OrderPage/hooks/queryKeys";
import { CompactInput } from "@shared/components/compact-form";
import { useAppQuery } from "@shared/hooks/useAppQuery";
import { useDebounceValue } from "@shared/hooks/useDebounceValue";
import {
  getAdminOrderList,
  type AdminOrderId,
  type AdminOrderListItem,
} from "@shared/services/order";
import { EMPTY_VALUE, formatCurrency, formatDate } from "@shared/utils/format";

import { cn } from "@seoul-moment/ui";

/** 이 글자 수부터 찾는다. 한 글자로는 후보가 너무 많다 */
const MIN_SEARCH_LENGTH = 2;
const SEARCH_DELAY_MS = 300;
const RESULT_COUNT = 10;

/**
 * 넣을 수 없는 후보의 이유. 목록에는 입금 대기 주문도 나오지만 묶음에는 결제 완료 주문만
 * 들어간다(입금 대기는 paidAt 이 없다).
 */
const getUnavailableReason = (
  order: AdminOrderListItem,
  selectedOrderIds: ReadonlySet<AdminOrderId>,
) => {
  if (selectedOrderIds.has(order.orderId)) return "추가됨";
  if (order.paidAt === null) return "결제 전";
  return null;
};

interface ShipmentOrderPickerProps {
  selectedOrderIds: ReadonlySet<AdminOrderId>;
  disabled: boolean;
  onAdd(order: AdminOrderListItem): void;
}

/**
 * 실린 주문 검색. 주문 목록 API 의 search 로 주문번호·받는 분·상품명을 한 번에 찾는다.
 * 결제 완료·입금 대기 주문이 나오고, 묶음에는 결제 완료 주문만 넣을 수 있다(아니면 저장 때 409).
 */
export function ShipmentOrderPicker({
  selectedOrderIds,
  disabled,
  onAdd,
}: ShipmentOrderPickerProps) {
  const listboxId = useId();
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const search = useDebounceValue(input.trim(), SEARCH_DELAY_MS);
  const canSearch = search.length >= MIN_SEARCH_LENGTH;
  const params = { search, count: RESULT_COUNT };

  const { data, isFetching } = useAppQuery({
    queryKey: orderQueryKeys.list(params),
    queryFn: () => getAdminOrderList(params),
    enabled: canSearch && isOpen,
    placeholderData: (previous) => previous,
  });

  // 입력이 짧아지면 직전 후보를 숨긴다
  const results = canSearch ? (data?.data.list ?? []) : [];
  const isTyping = input.trim() !== search;
  const showList = isOpen && input.trim().length >= MIN_SEARCH_LENGTH;

  const select = (order: AdminOrderListItem) => {
    if (getUnavailableReason(order, selectedOrderIds)) return;
    onAdd(order);
    setInput("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      if (results.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (index) => (index + step + results.length) % results.length,
      );
      return;
    }

    if (event.key === "Enter") {
      // 폼 저장이 아니라 주문 선택으로 받는다
      event.preventDefault();
      const exact = results.find((order) => order.orderNumber === input.trim());
      const target =
        results[activeIndex] ??
        exact ??
        (results.length === 1 ? results[0] : undefined);
      if (target) select(target);
      return;
    }

    if (event.key === "Escape" && isOpen) {
      // 드로어까지 닫히지 않게 목록만 닫는다
      event.stopPropagation();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
      />
      <CompactInput
        aria-activedescendant={
          showList && activeIndex >= 0
            ? `${listboxId}-${activeIndex}`
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={showList}
        aria-label="실린 주문 검색"
        autoComplete="off"
        className="pl-9"
        disabled={disabled}
        onBlur={() => setIsOpen(false)}
        onChange={(event) => {
          setInput(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="주문번호 · 받는 분 · 상품명으로 검색"
        role="combobox"
        value={input}
      />

      {showList && (
        <div
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          id={listboxId}
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-gray-500">
              {isTyping || isFetching
                ? "찾는 중…"
                : "결제된 주문 중에 맞는 주문이 없습니다."}
            </p>
          ) : (
            results.map((order, index) => {
              const unavailableReason = getUnavailableReason(
                order,
                selectedOrderIds,
              );

              // onMouseDown 에서 포커스를 옮기지 않아야 입력칸 blur 로 목록이 닫히기 전에 클릭이 처리된다
              return (
                <div
                  aria-disabled={unavailableReason !== null}
                  aria-selected={index === activeIndex}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm",
                    index === activeIndex && "bg-gray-100",
                    unavailableReason && "cursor-default opacity-50",
                  )}
                  id={`${listboxId}-${index}`}
                  key={order.orderId}
                  onClick={() => select(order)}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium tabular-nums text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {order.recipientName ?? EMPTY_VALUE} ·{" "}
                      {formatDate(order.paidAt)} · {order.deliveryStageLabel}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-gray-500">
                    {unavailableReason ?? formatCurrency(order.totalAmount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
