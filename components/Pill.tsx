import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number | string;
  icon?: React.ReactNode;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";
}

export const Pill = React.forwardRef<HTMLButtonElement, PillProps>(
  (
    {
      className,
      active = false,
      count,
      icon,
      onRemove,
      size = "md",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: "h-7 px-2.5 text-xs gap-1.5",
      md: "h-8 px-3.5 text-xs font-medium gap-2",
      lg: "h-10 px-4 text-sm font-medium gap-2.5",
    };

    const countSizeStyles = {
      sm: "text-[10px] px-1.5 py-0.2",
      md: "text-[11px] px-1.5 py-0.5",
      lg: "text-xs px-2 py-0.5",
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-full border transition-all duration-200 ease-out cursor-pointer select-none",
          active
            ? "bg-[#4F46E5] text-white border-[#4F46E5] "
            : "bg-white text-[#55556E] border-[#E6E6F0] hover:border-[#D4D4E4] hover:text-[#14142B] hover:bg-[#F6F6FB]",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
        {count !== undefined && (
          <span
            className={cn(
              "rounded-full font-semibold transition-colors",
              active
                ? "bg-white/20 text-white"
                : "bg-[#F1F1F8] text-[#55556E] group-hover:bg-[#E6E6F0]",
              countSizeStyles[size]
            )}
          >
            {count}
          </span>
        )}
        {onRemove && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              "ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors",
              active && "hover:bg-white/20"
            )}
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>
    );
  }
);

Pill.displayName = "Pill";

