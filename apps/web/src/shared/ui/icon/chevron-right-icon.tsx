import { type ComponentProps, forwardRef } from "react";

type IconProps = ComponentProps<"svg">;

const ChevronRightIcon = forwardRef<SVGSVGElement, IconProps>(
  function ChevronRightIcon(props, ref) {
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
          d="M6 12L10 8L6 4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  },
);

export default ChevronRightIcon;
