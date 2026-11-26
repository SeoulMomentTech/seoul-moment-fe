import type { AdminOrderEvent } from "@shared/services/order";

import { ORDER_EVENT_LABEL } from "../constants";
import { Hint } from "./OrderDetailParts";
import { formatTaipeiDateTime } from "../lib/taipeiDate";

/** adminId 가 있으면 관리자, userId 가 있으면 고객, 둘 다 없으면 시스템이 남긴 기록이다 */
const getActor = (event: AdminOrderEvent) => {
  if (event.adminId !== null) return `관리자 #${event.adminId}`;
  if (event.userId !== null) return "고객";
  return "시스템";
};

interface OrderEventsTabProps {
  events: AdminOrderEvent[];
}

/** 작업 이력 (최신순). 문구는 type 으로 만들고 message(변경 내용 그대로)는 보조로 붙인다 */
export function OrderEventsTab({ events }: OrderEventsTabProps) {
  if (events.length === 0) {
    return <Hint>아직 기록된 작업이 없습니다.</Hint>;
  }

  return (
    <ol className="grid gap-3 border-l border-gray-200 pl-4">
      {events.map((event) => (
        <li className="relative text-sm" key={event.eventId}>
          <span
            aria-hidden
            className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-gray-300"
          />
          <p className="text-xs text-gray-500">
            {formatTaipeiDateTime(event.createdAt)} · {getActor(event)}
          </p>
          <p className="font-medium text-gray-900">
            {ORDER_EVENT_LABEL[event.type] ?? event.type}
          </p>
          {event.message && (
            <p className="break-words text-xs text-gray-600">{event.message}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
