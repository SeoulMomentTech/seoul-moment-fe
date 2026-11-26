import type { ComponentProps } from "react";

import { Button, Input, SelectTrigger, Textarea, cn } from "@seoul-moment/ui";

/**
 * 드로어·모달처럼 좁은 패널용 입력 컨트롤.
 *
 * `@seoul-moment/ui` 의 Input(약 56px · 16px)·Button(40px · 16px)·SelectTrigger(36px · 14px)는
 * 높이와 글자 크기가 제각각이라 한 줄에 놓으면 어긋난다. 여기서는 모두 36px · 14px 로 맞추고,
 * 기본 Input 에 없는 포커스 표시를 더한다.
 */
const FIELD_BASE_CLASS = cn(
  "rounded-md border-gray-300 bg-white px-3 text-sm text-gray-900",
  "placeholder:text-gray-400",
  "transition-[border-color,box-shadow] focus-visible:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/10",
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/10",
);

/** CompactInput 과 높이·테두리를 맞춘 SelectTrigger */
export function CompactSelectTrigger({
  className,
  ...props
}: ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger
      className={cn(
        "h-9 border-gray-300 bg-white text-gray-900",
        "focus-visible:border-gray-900 focus-visible:ring-2 focus-visible:ring-gray-900/10",
        className,
      )}
      {...props}
    />
  );
}

export function CompactInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <Input className={cn(FIELD_BASE_CLASS, "h-9 py-0", className)} {...props} />
  );
}

export function CompactTextarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <Textarea
      className={cn(
        FIELD_BASE_CLASS,
        "resize-y py-2 leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

const COMPACT_BUTTON_SIZE_CLASS = {
  /** 입력칸과 한 줄에 놓는 기본 크기 */
  md: "h-9 gap-1.5 px-3.5 text-sm",
  /** 섹션 제목 옆 등 보조 작업 */
  sm: "h-8 gap-1 px-2.5 text-xs",
} as const;

export function CompactButton({
  className,
  size = "md",
  ...props
}: Omit<ComponentProps<typeof Button>, "size"> & {
  size?: keyof typeof COMPACT_BUTTON_SIZE_CLASS;
}) {
  return (
    <Button
      className={cn(
        "whitespace-nowrap",
        COMPACT_BUTTON_SIZE_CLASS[size],
        className,
      )}
      {...props}
    />
  );
}
