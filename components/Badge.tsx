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
    neutral: "bg-[#F6F6FB] text-[#55556E] border-[#E6E6F0]",
    accent: "bg-[#F7F6FF] text-[#4338CA] border-[#E0DEFC]",
    live: "bg-[#ECFDF5] text-[#0F8A5F] border-[#A7F3D0]",
    gold: "bg-[#FFF1D6] text-[#7A4E00] border-[#F7E5A9] font-semibold",
    silver: "bg-[#F1F1F8] text-[#475569] border-[#E6E6F0] font-semibold",
    bronze: "bg-[#FAF2EB] text-[#9A3412] border-[#ECD5C5] font-semibold",
    dark: "bg-[#14142B] text-white border-[#14142B]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  // Rank icons fallback
  const getRankIcon = () => {
    if (icon) return icon;
    if (variant === "gold") return <Trophy className="h-3 w-3 text-[#7A4E00]" />;
    if (variant === "silver") return <Medal className="h-3 w-3 text-[#64748B]" />;
    if (variant === "bronze") return <Award className="h-3 w-3 text-[#7A4E00]" />;
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
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F8A5F] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F8A5F]"></span>
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

