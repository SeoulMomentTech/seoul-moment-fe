"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { cn } from "@shared/lib/style";

const Select = SelectPrimitive.Root;

interface SelectGroupProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {
  className?: string;
}

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <SelectPrimitive.Group className={cn(className)} {...props} />;
}

interface SelectValueProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> {
  className?: string;
}

function SelectValue({ className, ...props }: SelectValueProps) {
  return <SelectPrimitive.Value className={cn(className)} {...props} />;
}

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  className?: string;
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "data-[placeholder]:text-muted-foreground focus:ring-transparent! flex h-10 w-full items-center justify-between rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

interface SelectScrollUpButtonProps
  extends React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.ScrollUpButton
  > {
  className?: string;
}

function SelectScrollUpButton({
  className,
  ...props
}: SelectScrollUpButtonProps) {
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

interface SelectScrollDownButtonProps
  extends React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.ScrollDownButton
  > {
  className?: string;
}

function SelectScrollDownButton({
  className,
  ...props
}: SelectScrollDownButtonProps) {
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDown className="h-4 w-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  className?: string;
  position?: "popper" | "item-aligned";
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 focus:ring-transparent! relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] origin-[--radix-select-content-transform-origin] overflow-y-auto overflow-x-hidden rounded-md border border-black/20 bg-white shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

interface SelectLabelProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {
  className?: string;
}

function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
      {...props}
    />
  );
}

interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  className?: string;
}

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "focus:bg-accent focus:text-accent-foreground focus:ring-transparent! relative flex w-full cursor-default select-none items-center rounded-sm px-[12px] py-[10px] text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "cursor-pointer hover:bg-black/10",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

interface SelectSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {
  className?: string;
}

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      className={cn("bg-muted -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
