"use client";

import { Check } from "lucide-react";

import { cn, HStack, VStack } from "@seoul-moment/ui";

import type { PasswordRuleKey } from "../model/schema";
import { usePasswordRules } from "../model/usePasswordRules";

interface Props {
  value: string;
}

const RULE_ORDER: { key: PasswordRuleKey; label: string }[] = [
  { key: "minLength", label: "최소 8자" },
  { key: "hasUpper", label: "적어도 하나의 대문자 영어 단어" },
  { key: "hasLower", label: "적어도 하나의 소문자 영어 단어" },
  { key: "hasNumber", label: "적어도 하나의 숫자" },
  { key: "hasSpecial", label: "특수 문자 하나 이상 포함 : ~#@$%&!*_?-<>등" },
];

export function PasswordChecklist({ value }: Props) {
  const status = usePasswordRules(value);

  return (
    <VStack className="w-full pb-[8px]" gap={10}>
      {RULE_ORDER.map(({ key, label }) => {
        const passed = status[key];
        return (
          <HStack className="w-full" gap={4} key={key}>
            <Check
              className={cn(
                "shrink-0",
                passed ? "text-foreground" : "text-black/40",
              )}
              size={12}
              strokeWidth={2.5}
            />
            <span
              className={cn(
                "text-body-4 leading-none",
                passed ? "text-foreground" : "text-black/40",
              )}
            >
              {label}
            </span>
          </HStack>
        );
      })}
    </VStack>
  );
}
