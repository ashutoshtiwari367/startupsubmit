import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  error?: string;
  helperText?: string;
  onClear?: () => void;
  showClear?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      size = "md",
      leftIcon,
      rightIcon,
      error,
      helperText,
      onClear,
      showClear = false,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: "h-8 text-xs px-2.5",
      md: "h-10 text-sm px-3.5",
      lg: "h-12 text-base px-4",
    };

    return (
      <div className="w-full">
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#55556E]">
              {leftIcon}
            </div>
          )}

          <input
            type={type}
            ref={ref}
            value={value}
            disabled={disabled}
            className={cn(
              "w-full rounded-[10px] bg-white border border-[#D4D4E4] text-[#14142B] placeholder:text-[#8A8AA3] transition-all duration-150 outline-none",
              "hover:border-[#B9B9CF]",
              "focus:border-[#4F46E5] focus-visible:outline-3 focus-visible:outline-[#C7C4FA] focus-visible:outline-offset-0",
              leftIcon ? "pl-10" : "",
              (rightIcon || (showClear && value)) ? "pr-10" : "",
              error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/15",
              disabled && "opacity-50 bg-[#F6F6FB] cursor-not-allowed",
              sizeStyles[size],
              className
            )}
            {...props}
          />

          {showClear && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 p-1 rounded-full text-[#55556E] hover:text-[#14142B] hover:bg-[#F6F6FB] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {rightIcon && !(showClear && value) && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#55556E]">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-[#DC2626] font-medium">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-[#55556E]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

