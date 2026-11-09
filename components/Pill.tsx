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
            ? "bg-[#5B5BF0] text-white border-[#5B5BF0] shadow-[0_2px_8px_rgba(91,91,240,0.25)]"
            : "bg-white text-[#57575C] border-[#E8E8E3] hover:border-[#D5D5CE] hover:text-[#0F0F10] hover:bg-[#FAFAF7]",
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
                : "bg-[#F3F4F6] text-[#57575C] group-hover:bg-[#E5E7EB]",
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

