"use client";
import React, { useContext } from "react";

import {
  AccordionItemContext,
  createAccordion,
} from "@gluestack-ui/core/accordion/creator";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import { Pressable, Text, View } from "react-native";

// gluestack 의 헤드리스 creator 에 React Native 기본 컴포넌트를 부품으로 꽂는다.
const UIAccordion = createAccordion({
  Root: View,
  Item: View,
  Header: View,
  Trigger: Pressable,
  Content: View,
  Icon: Text,
  TitleText: Text,
  ContentText: Text,
});

const accordionItemStyle = tva({
  base: "border-neutral-subtle border-b py-4",
});

const accordionTriggerStyle = tva({
  base: "flex-row items-center justify-between px-5",
});

const accordionTitleTextStyle = tva({
  base: "text-body-1 font-bold",
  variants: {
    disabled: {
      true: "text-neutral",
      false: "text-foreground",
    },
  },
});

const accordionIconStyle = tva({
  base: "text-body-2 text-neutral",
});

const accordionContentStyle = tva({
  base: "mt-3",
});

type IAccordionProps = React.ComponentPropsWithoutRef<typeof UIAccordion>;
type IAccordionItemProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Item
> & { className?: string };
type IAccordionTriggerProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Trigger
> & { className?: string };
type IAccordionTitleTextProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.TitleText
> & { className?: string };
type IAccordionContentProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Content
> & { className?: string };

const Accordion = UIAccordion;
const AccordionHeader = UIAccordion.Header;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Item>,
  IAccordionItemProps
>(({ className, ...props }, ref) => (
  <UIAccordion.Item
    ref={ref}
    {...props}
    className={accordionItemStyle({ class: className })}
  />
));

// 트리거의 접근성 속성(label/state)은 item context 의 상태에서 끌어와 항상 같이 내려준다.
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Trigger>,
  IAccordionTriggerProps
>(({ className, ...props }, ref) => {
  const { isDisabled, isExpanded, titleText } =
    useContext(AccordionItemContext);
  return (
    <UIAccordion.Trigger
      accessibilityLabel={titleText}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, expanded: !!isExpanded }}
      ref={ref}
      {...props}
      className={accordionTriggerStyle({ class: className })}
    />
  );
});

const AccordionTitleText = React.forwardRef<
  React.ElementRef<typeof UIAccordion.TitleText>,
  IAccordionTitleTextProps
>(({ className, ...props }, ref) => {
  const { isDisabled } = useContext(AccordionItemContext);
  return (
    <UIAccordion.TitleText
      ref={ref}
      {...props}
      className={accordionTitleTextStyle({
        disabled: !!isDisabled,
        class: className,
      })}
    />
  );
});

// 열림 여부를 +/− 로 보여 준다. 비활성 항목은 펼칠 수 없으니 아이콘을 그리지 않는다.
const AccordionIcon = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Icon>,
  React.ComponentPropsWithoutRef<typeof UIAccordion.Icon> & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  const { isDisabled, isExpanded } = useContext(AccordionItemContext);
  if (isDisabled) return null;
  return (
    <UIAccordion.Icon
      ref={ref}
      {...props}
      className={accordionIconStyle({ class: className })}
    >
      {isExpanded ? "−" : "+"}
    </UIAccordion.Icon>
  );
});

// creator 의 Content 는 접혀도 마운트를 유지하므로, 접힌 항목의 내용은 여기서 내린다.
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Content>,
  IAccordionContentProps
>(({ className, ...props }, ref) => {
  const { isDisabled, isExpanded } = useContext(AccordionItemContext);
  if (isDisabled || !isExpanded) return null;
  return (
    <UIAccordion.Content
      ref={ref}
      {...props}
      className={accordionContentStyle({ class: className })}
    />
  );
});

Accordion.displayName = "Accordion";
AccordionItem.displayName = "AccordionItem";
AccordionTrigger.displayName = "AccordionTrigger";
AccordionTitleText.displayName = "AccordionTitleText";
AccordionIcon.displayName = "AccordionIcon";
AccordionContent.displayName = "AccordionContent";

export type { IAccordionProps };
export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
};
