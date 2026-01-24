import { cn } from "@seoul-moment/ui";


interface OptionBadgeProps {
    label: string;
    colorCode?: string | null;
    onClick(): void;
}


export const OptionBadge = ({ label, colorCode, onClick }: OptionBadgeProps) => {
    return (
        <button
            className={cn("inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50", "px-3 py-1 text-xs text-gray-700 transition hover:border-gray-400")}
            onClick={onClick}
            type="button"
        >
            {colorCode && (
                <span
                    className="h-3 w-3 rounded-full border border-black/20"
                    style={{ background: colorCode }}
                />
            )}
            {label}
        </button>
    )
}