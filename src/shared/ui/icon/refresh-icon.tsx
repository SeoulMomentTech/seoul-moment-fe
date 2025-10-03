interface RefreshIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const RefreshIcon = ({
  className,
  width = 24,
  height = 24,
}: RefreshIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.33203 10.6667C5.33203 10.6667 6.66869 8.84548 7.75459 7.75883C8.84049 6.67218 10.3411 6 11.9987 6C15.3124 6 17.9987 8.68629 17.9987 12C17.9987 15.3137 15.3124 18 11.9987 18C9.2633 18 6.95544 16.1695 6.23321 13.6667M5.33203 10.6667V6.66667M5.33203 10.6667H9.33203"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default RefreshIcon;
