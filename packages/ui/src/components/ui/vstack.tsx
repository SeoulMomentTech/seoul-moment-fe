import type { ElementType } from "react";

import { Flex, type FlexBaseProps, type FlexProps } from "./flex";

type Align = "top" | "bottom" | "center" | "between" | "around";

type VStackProps<T extends ElementType> = Omit<
  FlexProps<T>,
  "direction" | "align" | "justify"
> & {
  reversed?: boolean;
  align?: Align;
};

/**
 * @description
 * vstack - vertical stack(세로로 쌓기)
 * 위-아래 방향으로 이어 붙입니다.
 * 즉, 행(row)을 추가한다고 생각하면 됩니다.
 **/

export function VStack<T extends ElementType = "div">({
  as,
  align = "top",
  reversed = false,
  children,
  ...props
}: VStackProps<T>) {
  const direction = reversed ? "column-reverse" : "column";
  const alignContent: Record<Align, FlexBaseProps["justify"]> = {
    top: "flex-start",
    bottom: "flex-end",
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
