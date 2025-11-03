interface FilterIconProps {
  className?: string;
  width?: number;
  height?: number;
}

const FilterIcon = ({
  className,
  width = 16,
  height = 16,
}: FilterIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      viewBox="0 0 16 16"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 5.33398L10 5.33399M10 5.33399C10 6.43855 10.8954 7.33398 12 7.33398C13.1046 7.33398 14 6.43855 14 5.33398C14 4.22941 13.1046 3.33398 12 3.33398C10.8954 3.33398 10 4.22942 10 5.33399ZM6 10.6673L14 10.6673M6 10.6673C6 11.7719 5.10457 12.6673 4 12.6673C2.89543 12.6673 2 11.7719 2 10.6673C2 9.56275 2.89543 8.66732 4 8.66732C5.10457 8.66732 6 9.56275 6 10.6673Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FilterIcon;
