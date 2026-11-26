import { useState, type FormEvent } from "react";

import { X } from "lucide-react";

import {
  CompactSelectTrigger,
  CompactButton,
  CompactInput,
  CompactTextarea,
} from "@shared/components/compact-form";
import { CUSTOMS_STATUSES } from "@shared/constants/shipment";
import type {
  AdminShipmentCustomsStatus,
  AdminShipmentDetail,
  AdminShipmentId,
  PostAdminShipmentResponse,
} from "@shared/services/shipment";
import axios from "axios";
import { toast } from "sonner";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@seoul-moment/ui";

import {
  useCreateAdminShipmentMutation,
  useUpdateAdminShipmentMutation,
} from "../hooks";
import { ShipmentOrderPicker } from "./ShipmentOrderPicker";
import {
  toCreateShipmentPayload,
  toPatchShipmentPayload,
  toShipmentFormValues,
  validateShipmentForm,
  type ShipmentFormValues,
} from "../lib/shipmentForm";

/** 서버 검증과 같다 */
const NUMBER_MAX = 100;
const CARRIER_MAX = 50;
const MEMO_MAX = 1000;
const ORDERS_MAX = 200;

/** 등록이면 shipment 가 없다 */
export type ShipmentDrawerTarget =
  | { type: "create" }
  | { type: "edit"; shipment: AdminShipmentDetail };

interface ShipmentFormDrawerProps {
  target: ShipmentDrawerTarget | null;
  onClose(): void;
}

/** 묶음 등록·수정. 통관 상태를 바꿔도 주문의 배송 단계는 바뀌지 않는다 */
export function ShipmentFormDrawer({
  target,
  onClose,
}: ShipmentFormDrawerProps) {
  return (
    <Drawer
      direction="right"
      onOpenChange={(open) => !open && onClose()}
      open={target !== null}
    >
      <DrawerContent className="w-full overflow-y-auto overflow-x-hidden rounded-none bg-white data-[vaul-drawer-direction=right]:sm:max-w-lg">
        {target && (
          <ShipmentForm
            // 다른 묶음을 열면 입력칸을 그 묶음 값으로 새로 채운다
            key={target.type === "edit" ? target.shipment.shipmentId : "new"}
            onClose={onClose}
            shipment={target.type === "edit" ? target.shipment : undefined}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

/** 다른 묶음과 번호가 겹쳐도 저장은 된다. 합배송·분할 신고로 실제로 겹칠 수 있어 경고만 띄운다 */
const warnDuplicates = (response: PostAdminShipmentResponse) => {
  const { sameIntlTrackingNoShipmentIds, sameImportDeclarationNoShipmentIds } =
    response;
  const ids = (list: AdminShipmentId[]) =>
    list.map((id) => `#${id}`).join(", ");

  if (sameIntlTrackingNoShipmentIds.length > 0) {
    toast.warning(
      `같은 국제운송장 번호를 쓰는 묶음이 있습니다: ${ids(sameIntlTrackingNoShipmentIds)}`,
    );
  }
  if (sameImportDeclarationNoShipmentIds.length > 0) {
    toast.warning(
      `같은 수입신고번호를 쓰는 묶음이 있습니다: ${ids(sameImportDeclarationNoShipmentIds)}`,
    );
  }
};

const getSaveErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 400) return "국제운송장 번호와 수입신고번호가 같습니다.";
    if (status === 404)
      return "묶음을 찾을 수 없습니다. 목록을 새로고침해주세요.";
    if (status === 409)
      return "없는 주문이거나 결제 완료가 아닌 주문이 있습니다.";
  }
  return "묶음을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.";
};

function ShipmentForm({
  shipment,
  onClose,
}: {
  shipment?: AdminShipmentDetail;
  onClose(): void;
}) {
  const isEdit = shipment !== undefined;
  const [initial] = useState(() => toShipmentFormValues(shipment));
  const [values, setValues] = useState<ShipmentFormValues>(initial);

  const createMutation = useCreateAdminShipmentMutation();
  const updateMutation = useUpdateAdminShipmentMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const validationError = validateShipmentForm(values);
  const patch = isEdit ? toPatchShipmentPayload(initial, values) : null;
  const isUnchanged = patch !== null && Object.keys(patch).length === 0;

  const setField = <K extends keyof ShipmentFormValues>(
    key: K,
    value: ShipmentFormValues[K],
  ) => setValues((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isPending || isUnchanged) return;
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const options = {
      onSuccess: (response: { data: PostAdminShipmentResponse }) => {
        toast.success(
          isEdit
            ? `묶음 #${response.data.shipmentId} 을 저장했습니다.`
            : `묶음 #${response.data.shipmentId} 을 등록했습니다.`,
        );
        warnDuplicates(response.data);
        onClose();
      },
      onError: (error: unknown) => toast.error(getSaveErrorMessage(error)),
    };

    if (isEdit && patch) {
      updateMutation.mutate(
        { shipmentId: shipment.shipmentId, payload: patch },
        options,
      );
    } else {
      createMutation.mutate(toCreateShipmentPayload(values), options);
    }
  };

  return (
    <form className="flex min-h-full flex-col" onSubmit={handleSubmit}>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-6 py-4">
        <DrawerTitle className="text-lg font-semibold text-gray-900">
          {isEdit ? `묶음 #${shipment.shipmentId}` : "묶음 등록"}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          국제배송 묶음의 운송장·수입신고번호·통관 상태
        </DrawerDescription>
        <button
          aria-label="닫기"
          className="ml-auto rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="grid flex-1 content-start gap-5 p-6">
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-xs font-medium text-gray-600">
            실린 주문 (필수 · {values.orders.length}/{ORDERS_MAX})
          </legend>
          {values.orders.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {values.orders.map((order) => (
                <li
                  className="inline-flex items-center gap-1 rounded bg-gray-100 py-0.5 pl-2 pr-1 text-xs tabular-nums text-gray-800"
                  key={order.orderId}
                >
                  {order.orderNumber}
                  <button
                    aria-label={`${order.orderNumber} 빼기`}
                    className="rounded p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                    onClick={() =>
                      setField(
                        "orders",
                        values.orders.filter(
                          (item) => item.orderId !== order.orderId,
                        ),
                      )
                    }
                    type="button"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <ShipmentOrderPicker
            disabled={values.orders.length >= ORDERS_MAX}
            onAdd={(order) =>
              setField("orders", [
                ...values.orders,
                { orderId: order.orderId, orderNumber: order.orderNumber },
              ])
            }
            selectedOrderIds={
              new Set(values.orders.map((order) => order.orderId))
            }
          />
          {isEdit && (
            <p className="text-xs text-gray-500">
              주문을 넣거나 빼면 실린 주문 목록이 통째로 바뀝니다.
            </p>
          )}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="intl-carrier"
            label="국제운송사"
            maxLength={CARRIER_MAX}
            onChange={(value) => setField("intlCarrier", value)}
            placeholder="EMS"
            value={values.intlCarrier}
          />
          <TextField
            id="intl-tracking"
            label="국제운송장 번호"
            maxLength={NUMBER_MAX}
            onChange={(value) => setField("intlTrackingNo", value)}
            placeholder="EG123456789KR"
            value={values.intlTrackingNo}
          />
          <TextField
            id="hawb"
            label="분할운송장(HAWB)"
            maxLength={NUMBER_MAX}
            onChange={(value) => setField("houseAirwaybillNo", value)}
            value={values.houseAirwaybillNo}
          />
          <TextField
            id="import-declaration"
            label="수입신고번호"
            maxLength={NUMBER_MAX}
            onChange={(value) => setField("importDeclarationNo", value)}
            placeholder="AA 26 123 45678"
            value={values.importDeclarationNo}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs text-gray-600" htmlFor="customs-status">
            통관 상태
          </Label>
          <Select
            onValueChange={(value) =>
              setField("customsStatus", value as AdminShipmentCustomsStatus)
            }
            value={values.customsStatus}
          >
            <CompactSelectTrigger id="customs-status">
              <SelectValue />
            </CompactSelectTrigger>
            <SelectContent className="**:cursor-pointer bg-white">
              {CUSTOMS_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            주문의 배송 단계는 바뀌지 않습니다. 단계는 주문 목록에서 따로
            바꿉니다.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="declared-at"
            label="수입신고 일시"
            onChange={(value) => setField("declaredAt", value)}
            type="datetime-local"
            value={values.declaredAt}
          />
          <TextField
            id="cleared-at"
            label="통관 완료 일시"
            onChange={(value) => setField("clearedAt", value)}
            type="datetime-local"
            value={values.clearedAt}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs text-gray-600" htmlFor="memo">
            메모 (고객 비노출)
          </Label>
          <CompactTextarea
            id="memo"
            maxLength={MEMO_MAX}
            onChange={(event) => setField("memo", event.target.value)}
            rows={3}
            value={values.memo}
          />
        </div>
      </div>

      <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-gray-200 bg-white px-6 py-4">
        <CompactButton onClick={onClose} type="button" variant="outline">
          닫기
        </CompactButton>
        <CompactButton disabled={isPending || isUnchanged} type="submit">
          {isPending ? "저장 중…" : isEdit ? "저장" : "등록"}
        </CompactButton>
      </footer>
    </form>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange(value: string): void;
  maxLength?: number;
  placeholder?: string;
  type?: "text" | "datetime-local";
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-gray-600" htmlFor={id}>
        {label}
      </Label>
      <CompactInput
        autoComplete="off"
        id={id}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </div>
  );
}
