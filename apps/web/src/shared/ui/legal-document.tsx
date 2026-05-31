import type { PropsWithChildren } from "react";

import { cn, VStack } from "@seoul-moment/ui";

/**
 * Shared layout primitives for static legal documents
 * (terms of service, privacy policy, ...).
 *
 * `VStack` centers its children horizontally, so every text element
 * carries `w-full` to stay left-aligned.
 */

export function LegalDocument({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <VStack className="w-full pt-[40px]" gap={32}>
      <h1 className="text-title-4 text-foreground w-full font-semibold leading-snug">
        {title}
      </h1>
      {children}
    </VStack>
  );
}

export function Section({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <VStack className="w-full" gap={12}>
      <h2 className="text-body-1 text-foreground w-full font-semibold leading-snug">
        {title}
      </h2>
      <VStack className="w-full" gap={16}>
        {children}
      </VStack>
    </VStack>
  );
}

export function SubSection({
  title,
  children,
}: PropsWithChildren<{ title?: string }>) {
  return (
    <VStack className="w-full" gap={6}>
      {title ? (
        <h3 className="text-body-2 text-foreground w-full font-medium leading-snug">
          {title}
        </h3>
      ) : null}
      {children}
    </VStack>
  );
}

export function Paragraph({ children }: PropsWithChildren) {
  return (
    <p className="text-body-3 w-full leading-relaxed text-black/60">
      {children}
    </p>
  );
}

export function Bullets({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "text-body-3 w-full list-disc space-y-1 pl-5 leading-relaxed text-black/60",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
