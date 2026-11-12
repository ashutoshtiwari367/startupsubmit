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
      "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150 ease-out cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variantStyles = {
      primary:
        "bg-[#4F46E5] text-white font-bold hover:bg-[#4338CA] active:bg-[#3730A3]",
      secondary:
        "bg-white text-[#14142B] border border-[#D4D4E4] hover:bg-[#F6F6FB] hover:border-[#B9B9CF] active:bg-[#EDEDF5]",
      ghost:
        "bg-transparent text-[#55556E] hover:bg-[#14142B]/[0.05] hover:text-[#14142B] active:bg-[#14142B]/[0.08]",
      "accent-soft":
        "bg-[#F7F6FF] text-[#4338CA] border border-[#E0DEFC] hover:bg-[#E0DEFC] active:bg-[#D4D1FA]",
      destructive:
        "bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] hover:bg-[#FEE2E2] active:bg-[#FECACA]",
    };

    const sizeStyles = {
      sm: "h-10 px-3.5 text-sm gap-1.5 rounded-[10px]",
      md: "h-12 px-5 text-sm gap-2 rounded-xl",
      lg: "h-[52px] px-6 text-base gap-2.5 rounded-xl",
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

