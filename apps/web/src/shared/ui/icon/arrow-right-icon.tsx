import { type ComponentProps, forwardRef } from "react";

type IconProps = ComponentProps<"svg">;

const ArrowRightIcon = forwardRef<SVGSVGElement, IconProps>(
  function ArrowRightIcon(props, ref) {
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
          d="M3.33398 8.00065H12.6673M12.6673 8.00065L8.00065 3.33398M12.6673 8.00065L8.00065 12.6673"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    );
  },
);

export default ArrowRightIcon;
