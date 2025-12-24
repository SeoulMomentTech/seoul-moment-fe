import type { ElementType } from "react";

import Flex, { type FlexBaseProps, type FlexProps } from "./flex";

type Align = "start" | "end" | "center" | "between" | "around";

type HStackProps<T extends ElementType> = Omit<
  FlexProps<T>,
  "direction" | "align" | "justify"
> & {
  reversed?: boolean;
  align?: Align;
};

export default function HStack<T extends ElementType = "div">({
  as,
  align = "start",
  reversed = false,
  children,
  ...props
}: HStackProps<T>) {
  const direction = reversed ? "row-reverse" : "row";
  const alignContent: Record<Align, FlexBaseProps["justify"]> = {
    start: "flex-start",
    end: "flex-end",
    center: "center",
    between: "space-between",
    around: "space-around",
  };

  return (
    <Flex
      align="center"
      as={as}
      direction={direction}
      justify={alignContent[align]}
      {...props}
    >
      {children}
    </Flex>
  );
}
