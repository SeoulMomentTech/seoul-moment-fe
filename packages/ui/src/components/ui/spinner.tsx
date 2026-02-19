import * as React from "react"

import { cn } from "../../lib/utils"

interface SpinnerProps extends React.ComponentProps<"svg"> {
    icon?: React.ReactElement;
}

function Spinner({ className, icon, ...props }: SpinnerProps) {
    const defaultIcon = (
        <svg
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );

    const iconToRender = icon || defaultIcon;

    return React.cloneElement(iconToRender, {
        "aria-label": "Loading",
        role: "status",
        className: cn("size-4 animate-spin", className, iconToRender.props.className),
        ...props,
    } as React.ComponentProps<"svg">);
}

export { Spinner }