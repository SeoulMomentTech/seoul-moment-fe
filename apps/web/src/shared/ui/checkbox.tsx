"use client";

import { useEffect, useRef, type ComponentProps } from "react";

import { CheckIcon } from "lucide-react";

import { cn } from "@shared/lib/style";

interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  /** 일부만 선택된 상태. 전체 선택 체크박스에서 쓴다. */
  indeterminate?: boolean;
  className?: string;
}

/**
 * 네이티브 `input[type=checkbox]` 기반 체크박스.
 *
 * Radix 를 쓰지 않는 이유 — 폼 안이 아니라 상태 토글이고, Radix 가 필요한 이유(포털·포커스 트랩)가
 * 체크박스에는 해당되지 않는다. 반면 네이티브는 키보드·스크린리더·`indeterminate` 를 공짜로 준다.
 * `indeterminate` 는 속성이 아니라 DOM 프로퍼티라서 ref 로만 세팅할 수 있다.
 *
 * 체크 색이 brand 가 아니라 black 인 것은 디자인 언어를 따른 것이다 — 디자인에서 `#f37b2a` 는
 * 할인율과 별점 전용이고 선택·주요 액션은 전부 black 이다.
 */
export function Checkbox({
  indeterminate = false,
  checked,
  className,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(
    function syncIndeterminate() {
      if (ref.current) ref.current.indeterminate = indeterminate;
    },
    [indeterminate],
  );

  const filled = indeterminate || !!checked;

  return (
    <span
      className={cn("relative inline-flex size-[20px] shrink-0", className)}
    >
      <input
        checked={checked}
        className="peer absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
        ref={ref}
        type="checkbox"
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none flex size-full items-center justify-center rounded-[3px] border-[1.5px] transition-colors",
          "duration-normal",
          filled ? "border-black bg-black" : "border-black/20 bg-white",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-black peer-focus-visible:ring-offset-1",
          "peer-disabled:opacity-40",
        )}
      >
        {indeterminate ? (
          <span className="h-[1.5px] w-[9px] rounded-[1px] bg-white" />
        ) : (
          checked && (
            <CheckIcon
              className="text-white"
              height={13}
              strokeWidth={3}
              width={13}
            />
          )
        )}
      </span>
    </span>
  );
}
