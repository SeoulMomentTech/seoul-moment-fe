import type {
  ComponentPropsWithoutRef,
  ElementType,
  PropsWithChildren,
} from "react";

export interface FlexBaseProps {
  as?: Extract<
    ElementType,
    | "div"
    | "main"
    | "aside"
    | "footer"
    | "header"
    | "section"
    | "span"
    | "nav"
    | "article"
    | "form"
    | "ul"
    | "ol"
    | "li"
  >;
  display?: "flex" | "none" | "inline-flex";
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: "wrap" | "nowrap";
  justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "stretch"
    | "space-evenly";
  align?: "flex-start" | "flex-end" | "center" | "baseline" | "stretch";
  gap?: string | number;
  className?: string;
}

export type FlexProps<T extends ElementType> = PropsWithChildren<
  FlexBaseProps & Omit<ComponentPropsWithoutRef<T>, keyof FlexBaseProps>
>;

export default function Flex<T extends ElementType = "div">({
  children,
  as = "div",
  display = "flex",
  direction = "row",
  wrap = "nowrap",
  justify = "flex-start",
  align = "flex-start",
  gap = "0",
  className,
  style,
  ...props
}: FlexProps<T>) {
  const Component = as;

  const computedStyle = {
    display,
    gap: typeof gap === "number" ? `${gap}px` : gap,
    flexDirection: direction,
    flexWrap: wrap,
    justifyContent: justify,
    alignItems: align,
  } as const;

  return (
    <Component
      className={className}
      style={{ ...style, ...computedStyle }}
      {...props}
    >
      {children}
    </Component>
  );
}
