"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { cn, Input, VStack } from "@seoul-moment/ui";

import PasswordChecklist from "./PasswordChecklist";

type Props = Omit<React.ComponentProps<"input">, "type" | "value"> & {
  value: string;
  showChecklist?: boolean;
};

export default function PasswordField({
  value,
  showChecklist = false,
  className,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? Eye : EyeOff;

  return (
    <VStack className="w-full" gap={16}>
      <div className="relative w-full">
        <Input
          className={cn("pr-[36px] max-sm:h-12", className)}
          type={visible ? "text" : "password"}
          value={value}
          {...props}
        />
        <button
          aria-label={visible ? "hide password" : "show password"}
          className="absolute right-[12px] top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-black/40"
          onClick={() => setVisible((prev) => !prev)}
          tabIndex={-1}
          type="button"
        >
          <Icon size={16} strokeWidth={1.75} />
        </button>
      </div>
      {showChecklist && <PasswordChecklist value={value} />}
    </VStack>
  );
}
