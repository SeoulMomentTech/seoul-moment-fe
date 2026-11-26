import { useState } from "react";

import { OrderConfirmDialog } from "@pages/OrderPage/components";
import { CompactSelectTrigger } from "@shared/components/compact-form";
import type {
  AdminUser,
  AdminUserRole,
  AdminUserStatus,
} from "@shared/services/user";
import { toast } from "sonner";

import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@seoul-moment/ui";

import { useUpdateAdminUserMutation } from "../hooks";
import {
  ADMIN_ROLES,
  ADMIN_ROLE_LABEL,
  ADMIN_STATUSES,
  ADMIN_STATUS_LABEL,
  canUseSuperAdminApi,
  getPermissionErrorMessage,
  toPermissionPatch,
  type PermissionValues,
} from "../lib/permission";

interface PermissionDialogProps {
  user: AdminUser;
  onClose(): void;
}

/**
 * 관리자 계정의 역할·상태 변경. 다음 요청부터 바로 적용된다.
 * 열 때마다 그 계정 값으로 채우도록 부모가 계정 ID 를 key 로 준다
 */
export function PermissionDialog({ user, onClose }: PermissionDialogProps) {
  const [current, setValues] = useState<PermissionValues>({
    role: user.role,
    status: user.status,
  });
  const mutation = useUpdateAdminUserMutation();

  const patch = toPermissionPatch(user, current);
  const isUnchanged = Object.keys(patch).length === 0;

  const handleConfirm = () => {
    if (isUnchanged) return;
    mutation.mutate(
      { userId: user.id, payload: patch },
      {
        onSuccess: () => {
          toast.success(`${user.name} 계정의 권한을 바꿨습니다.`);
          onClose();
        },
        onError: (error) =>
          toast.error(
            getPermissionErrorMessage(error, "권한을 바꾸지 못했습니다."),
          ),
      },
    );
  };

  return (
    <OrderConfirmDialog
      confirmLabel="변경"
      description={`${user.name} · ${user.email}`}
      disabled={isUnchanged}
      isPending={mutation.isPending}
      onClose={onClose}
      onConfirm={handleConfirm}
      open
      title="권한 변경"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className="text-xs text-gray-600" htmlFor="admin-role">
            역할
          </Label>
          <Select
            onValueChange={(role) =>
              setValues({ ...current, role: role as AdminUserRole })
            }
            value={current.role}
          >
            <CompactSelectTrigger id="admin-role">
              <SelectValue />
            </CompactSelectTrigger>
            <SelectContent className="**:cursor-pointer bg-white">
              {ADMIN_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {ADMIN_ROLE_LABEL[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs text-gray-600" htmlFor="admin-status">
            상태
          </Label>
          <Select
            onValueChange={(status) =>
              setValues({ ...current, status: status as AdminUserStatus })
            }
            value={current.status}
          >
            <CompactSelectTrigger id="admin-status">
              <SelectValue />
            </CompactSelectTrigger>
            <SelectContent className="**:cursor-pointer bg-white">
              {ADMIN_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {ADMIN_STATUS_LABEL[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {current.role === "super_admin" && !canUseSuperAdminApi(current) && (
        <p className="text-xs text-amber-700">
          상태가 ‘정상’이 아니면 최고 관리자라도 환불·강제 탈퇴·권한 관리를 할
          수 없습니다.
        </p>
      )}
    </OrderConfirmDialog>
  );
}
