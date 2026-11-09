import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "accent-soft" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-[#5B5BF0] hover:bg-[#4B4BE5] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(91,91,240,0.25)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_6px_20px_rgba(91,91,240,0.35)] hover:-translate-y-0.5",
      secondary:
        "bg-white hover:bg-[#F5F5F0] text-[#0F0F10] border border-[#E8E8E3] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-[#D5D5CE] hover:-translate-y-0.5",
      ghost:
        "bg-transparent hover:bg-[#0F0F10]/[0.05] text-[#57575C] hover:text-[#0F0F10]",
      "accent-soft":
        "bg-[#EEF0FE] hover:bg-[#E2E5FD] text-[#4338CA] font-semibold border border-[#D5D8FC]",
      destructive:
        "bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5 rounded-[8px]",
      md: "h-10 px-4 text-sm gap-2 rounded-[10px]",
      lg: "h-12 px-6 text-base gap-2.5 rounded-[10px]",
      icon: "h-10 w-10 p-0 rounded-[10px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

