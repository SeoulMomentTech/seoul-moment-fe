interface XSolidIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const XSolidIcon = ({
  className,
  width = 16,
  height = 16,
}: XSolidIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      viewBox="0 0 16 16"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="black" fill-opacity="0.2" height="16" rx="8" width="16" />
      <path
        d="M10.5 5.5L5.5 10.5M5.5 5.5L10.5 10.5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default XSolidIcon;
