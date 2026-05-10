"use client";

import { CheckIcon, ChevronLeftIcon } from "lucide-react";

import {
  Button,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  HStack,
} from "@seoul-moment/ui";

interface BaseProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

interface SuccessProps extends BaseProps {
  status: "success";
  onContinue(): void;
}

interface ErrorProps extends BaseProps {
  status: "error";
  onCancel(): void;
  onRetry(): void;
}

type PhoneVerificationResultModalProps = SuccessProps | ErrorProps;

export function PhoneVerificationResultModal(
  props: PhoneVerificationResultModalProps,
) {
  const { open, onOpenChange, status } = props;
  const isSuccess = status === "success";

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          "gap-0 border-0 bg-white p-0 shadow-[0px_2px_10px_rgba(0,0,0,0.04)]",
          "sm:w-[320px] sm:max-w-[320px] sm:rounded-[8px]",
          "max-sm:left-0 max-sm:top-0 max-sm:h-screen max-sm:w-screen",
          "max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0",
          "max-sm:rounded-none",
          "max-sm:data-[state=open]:slide-in-from-bottom",
          "max-sm:data-[state=open]:[--tw-enter-scale:1]",
          "max-sm:data-[state=open]:[--tw-enter-opacity:1]",
          "max-sm:data-[state=closed]:slide-out-to-bottom",
          "max-sm:data-[state=closed]:[--tw-exit-scale:1]",
          "max-sm:data-[state=closed]:[--tw-exit-opacity:1]",
        )}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {isSuccess ? "휴대폰 번호 인증 완료" : "휴대폰 번호 인증 실패"}
        </DialogTitle>

        <div className="flex h-full w-full flex-col">
          <header className="relative h-14 w-full border-b border-black/10 px-[20px] sm:hidden">
            <DialogClose
              aria-label="뒤로 가기"
              className="absolute left-[20px] top-1/2 -translate-y-1/2 cursor-pointer outline-none"
            >
              <ChevronLeftIcon size={24} />
            </DialogClose>
            <div className="flex h-full w-full items-center">
              <p className="text-body-2 text-foreground pl-[28px] font-semibold leading-none">
                휴대폰 번호 인증
              </p>
            </div>
          </header>

          <div
            className={cn(
              "flex w-full flex-col items-center",
              "sm:gap-[32px]",
              isSuccess
                ? "sm:px-[24px] sm:pb-[24px] sm:pt-[32px]"
                : "sm:px-[32px] sm:pb-[24px] sm:pt-[40px]",
              "max-sm:flex-1 max-sm:gap-[80px] max-sm:px-[20px] max-sm:pt-[120px]",
            )}
          >
            <div className="flex w-full flex-col items-center gap-[24px]">
              <div
                className={cn(
                  "flex size-[40px] items-center justify-center rounded-full",
                  isSuccess ? "bg-black/10" : "bg-danger/10",
                )}
              >
                {isSuccess ? (
                  <CheckIcon
                    className="text-foreground"
                    size={20}
                    strokeWidth={2.5}
                  />
                ) : (
                  <span className="text-error text-body-1 font-bold leading-none">
                    !
                  </span>
                )}
              </div>

              {isSuccess ? (
                <p className="text-body-2 text-foreground w-full text-center leading-none">
                  인증이 완료되었습니다.
                </p>
              ) : (
                <p className="text-body-2 text-foreground w-full whitespace-pre-line text-center leading-[1.5]">
                  {`인증에 실패하였습니다.\n다시 시도해주세요.`}
                </p>
              )}
            </div>

            {isSuccess ? (
              <Button
                className="w-full rounded-[4px] py-[16px] font-semibold"
                onClick={props.onContinue}
                type="button"
              >
                <span className="max-sm:hidden">확인</span>
                <span className="hidden max-sm:inline">계속하기</span>
              </Button>
            ) : (
              <HStack align="center" className="w-full" gap={8}>
                <Button
                  className="flex-1 rounded-[4px] py-[16px] font-semibold"
                  onClick={props.onCancel}
                  type="button"
                  variant="outline"
                >
                  취소
                </Button>
                <Button
                  className="flex-1 rounded-[4px] py-[16px] font-semibold"
                  onClick={props.onRetry}
                  type="button"
                >
                  다시 시도하기
                </Button>
              </HStack>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
