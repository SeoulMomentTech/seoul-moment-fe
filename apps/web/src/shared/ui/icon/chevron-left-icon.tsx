import { type ComponentProps, forwardRef } from "react";

type IconProps = ComponentProps<"svg">;

const ChevronLeftIcon = forwardRef<SVGSVGElement, IconProps>(
  function ChevronLeftIcon(props, ref) {
    return (
      <svg
        fill="none"
        height="16"
        ref={ref}
        viewBox="0 0 16 16"
        width="16"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M10 12L6 8L10 4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
);

export default ChevronLeftIcon;
