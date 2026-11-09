import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "accent-border";
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-white border border-[#E8E8E3] shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
      elevated:
        "bg-white border border-[#E8E8E3] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.05)]",
      flat: "bg-white border border-[#E8E8E3]",
      "accent-border":
        "bg-white border-2 border-[#5B5BF0] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(91,91,240,0.1)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[14px] overflow-hidden transition-all duration-200 ease-out",
          variantStyles[variant],
          interactive &&
            "cursor-pointer hover:border-[#D5D5CE] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_12px_28px_rgba(91,91,240,0.06)] active:translate-y-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 md:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-heading text-lg md:text-xl font-bold tracking-tight text-[#0F0F10]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#66666B] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 md:p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-5 md:p-6 pt-0 border-t border-[#E8E8E3]/60 mt-auto",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

