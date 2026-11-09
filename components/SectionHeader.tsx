import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  badge?: React.ReactNode;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  className,
  badge,
  title,
  description,
  action,
  align = "left",
  size = "md",
  ...props
}) => {
  const titleSizeStyles = {
    sm: "text-xl md:text-2xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
  };

  const descSizeStyles = {
    sm: "text-sm max-w-xl",
    md: "text-base max-w-2xl",
    lg: "text-lg max-w-3xl",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "center" ? "text-center items-center" : "",
        action && align === "left" ? "md:flex-row md:items-end md:justify-between" : "",
        className
      )}
      {...props}
    >
      <div className={cn("flex flex-col", align === "center" ? "items-center" : "items-start")}>
        {badge && <div className="mb-2">{badge}</div>}
        <h2
          className={cn(
            "font-heading font-extrabold tracking-[-0.03em] text-[#0F0F10] leading-tight",
            titleSizeStyles[size]
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-1.5 text-[#66666B] leading-relaxed",
              descSizeStyles[size]
            )}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div
          className={cn(
            "mt-4 md:mt-0 flex items-center shrink-0",
            align === "center" ? "justify-center" : ""
          )}
        >
          {action}
        </div>
      )}
    </div>
  );
};
