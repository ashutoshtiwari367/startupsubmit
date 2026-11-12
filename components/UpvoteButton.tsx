import React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";

export interface UpvoteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  count: number;
  isUpvoted?: boolean;
  onUpvoteToggle?: (newUpvoted: boolean) => void;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
}

export const UpvoteButton: React.FC<UpvoteButtonProps> = ({
  className,
  count,
  isUpvoted = false,
  onUpvoteToggle,
  orientation = "vertical",
  size = "md",
  disabled = false,
  ...props
}) => {
  const [upvoted, setUpvoted] = React.useState(isUpvoted);
  const [currentCount, setCurrentCount] = React.useState(count);
  const [isBouncing, setIsBouncing] = React.useState(false);

  React.useEffect(() => {
    setUpvoted(isUpvoted);
    setCurrentCount(count);
  }, [isUpvoted, count]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled) return;

    const nextState = !upvoted;
    setUpvoted(nextState);
    setCurrentCount((prev) => (nextState ? prev + 1 : prev - 1));
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);

    onUpvoteToggle?.(nextState);
  };

  const formatCount = (n: number) => {
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + "k";
    }
    return n.toString();
  };

  const verticalSizes = {
    sm: "w-12 h-14 p-1.5 text-xs rounded-[10px]",
    md: "w-14 h-16 p-2 text-xs rounded-[10px]",
    lg: "w-16 h-20 p-2.5 text-sm rounded-[12px]",
  };

  const horizontalSizes = {
    sm: "h-8 px-3 text-xs gap-1.5 rounded-[10px]",
    md: "h-10 px-4 text-sm gap-2 rounded-[10px]",
    lg: "h-12 px-5 text-base gap-2.5 rounded-[10px]",
  };

  const chevronSizes = {
    sm: "h-3.5 w-3.5 stroke-[2.5]",
    md: "h-4 w-4 stroke-[2.5]",
    lg: "h-5 w-5 stroke-[2.5]",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Upvote, currently ${currentCount} upvotes`}
      className={cn(
        "group relative flex items-center justify-center font-semibold transition-all duration-200 select-none cursor-pointer border",
        orientation === "vertical"
          ? cn("flex-col", verticalSizes[size])
          : cn("flex-row", horizontalSizes[size]),
        upvoted
          ? "bg-[#F7F6FF] text-[#4F46E5] border-[#4F46E5] "
          : "bg-white text-[#14142B] border-[#E6E6F0] hover:border-[#D4D4E4] hover:bg-[#F6F6FB] ",
        "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      <ChevronUp
        className={cn(
          chevronSizes[size],
          "transition-transform duration-200",
          upvoted ? "text-[#4F46E5]" : "text-[#55556E] group-hover:text-[#4F46E5]",
          isBouncing && "-translate-y-1 scale-110",
          !upvoted && "group-hover:-translate-y-0.5"
        )}
      />
      <span
        className={cn(
          "font-mono tracking-tight",
          upvoted ? "text-[#4F46E5] font-bold" : "text-[#14142B]"
        )}
      >
        {formatCount(currentCount)}
      </span>
    </button>
  );
};

