import React from "react";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "accent" | "live" | "gold" | "silver" | "bronze" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  rankNumber?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  icon,
  rankNumber,
  children,
  ...props
}) => {
  const variantStyles = {
    neutral: "bg-[#F5F5F0] text-[#57575C] border-[#E8E8E3]",
    accent: "bg-[#EEF0FE] text-[#4338CA] border-[#D5D8FC]",
    live: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
    gold: "bg-[#FEF9E7] text-[#B45309] border-[#F7E5A9] font-semibold",
    silver: "bg-[#F3F4F6] text-[#475569] border-[#E2E4E8] font-semibold",
    bronze: "bg-[#FAF2EB] text-[#9A3412] border-[#ECD5C5] font-semibold",
    dark: "bg-[#0F0F10] text-white border-[#0F0F10]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  // Rank icons fallback
  const getRankIcon = () => {
    if (icon) return icon;
    if (variant === "gold") return <Trophy className="h-3 w-3 text-[#D97706]" />;
    if (variant === "silver") return <Medal className="h-3 w-3 text-[#64748B]" />;
    if (variant === "bronze") return <Award className="h-3 w-3 text-[#B45309]" />;
    return null;
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-full border transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {variant === "live" && !icon && (
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
        </span>
      )}
      {getRankIcon()}
      {rankNumber !== undefined && (
        <span className="tracking-tight">#{rankNumber}</span>
      )}
      {children}
    </span>
  );
};

