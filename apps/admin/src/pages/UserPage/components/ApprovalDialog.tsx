import { OrderConfirmDialog } from "@pages/OrderPage/components";
import type { AdminUser } from "@shared/services/user";
import { toast } from "sonner";

import { useUpdateAdminUserMutation } from "../hooks";
import {
  APPROVAL_PATCH,
  getPermissionErrorMessage,
  type ApprovalAction,
} from "../lib/permission";

interface ApprovalDialogProps {
  target: { user: AdminUser; action: ApprovalAction } | null;
  onClose(): void;
}

const COPY: Record<
  ApprovalAction,
  { title: string; confirmLabel: string; description: string; done: string }
> = {
  approve: {
    title: "가입 승인",
    confirmLabel: "승인",
    description:
      "상태를 ‘정상’으로 바꿔 바로 로그인할 수 있게 합니다. 역할은 관리자로 유지되며, 최고 관리자가 필요하면 권한 변경에서 바꾸세요.",
    done: "가입을 승인했습니다.",
  },
  reject: {
    title: "가입 거절",
    confirmLabel: "거절",
    description:
      "상태를 ‘차단’으로 바꿔 로그인할 수 없게 합니다. 나중에 권한 변경에서 되돌릴 수 있습니다.",
    done: "가입을 거절했습니다.",
  },
};

/** 승인 대기(WAIT) 계정의 승인·거절 확인 */
export function ApprovalDialog({ target, onClose }: ApprovalDialogProps) {
  const mutation = useUpdateAdminUserMutation();
  const copy = target ? COPY[target.action] : null;

  const handleConfirm = () => {
    if (!target || !copy) return;
    mutation.mutate(
      { userId: target.user.id, payload: APPROVAL_PATCH[target.action] },
      {
        onSuccess: () => {
          toast.success(copy.done);
          onClose();
        },
        onError: (error) =>
          toast.error(getPermissionErrorMessage(error, "처리하지 못했습니다.")),
      },
    );
  };

  return (
    <OrderConfirmDialog
      confirmLabel={copy?.confirmLabel ?? ""}
      description={
        target ? (
          <>
            <p className="font-medium text-gray-900">
              {target.user.name} · {target.user.email}
            </p>
            <p className="mt-1">{copy?.description}</p>
          </>
        ) : (
          ""
        )
      }
      destructive={target?.action === "reject"}
      isPending={mutation.isPending}
      onClose={onClose}
      onConfirm={handleConfirm}
      open={target !== null}
      title={copy?.title ?? ""}
    />
  );
}
