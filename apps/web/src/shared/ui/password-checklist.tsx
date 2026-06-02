"use client";

import { Check } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn, HStack, VStack } from "@seoul-moment/ui";

import {
  type PasswordRuleKey,
  usePasswordRules,
} from "../lib/hooks/usePasswordRules";

interface Props {
  value: string;
}

const RULE_ORDER: { key: PasswordRuleKey; labelKey: string }[] = [
  { key: "minLength", labelKey: "minimum_characters" },
  { key: "hasUpper", labelKey: "least_one_uppercase" },
  { key: "hasLower", labelKey: "least_one_lowercase" },
  { key: "hasNumber", labelKey: "least_one_number" },
  { key: "hasSpecial", labelKey: "least_one_special" },
];

export function PasswordChecklist({ value }: Props) {
  const t = useTranslations();
  const status = usePasswordRules(value);

  return (
    <VStack className="w-full pb-[8px]" gap={10}>
      {RULE_ORDER.map(({ key, labelKey }) => {
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
              {t(labelKey)}
            </span>
          </HStack>
        );
      })}
    </VStack>
  );
}
