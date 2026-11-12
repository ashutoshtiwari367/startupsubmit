import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "squircle";
  status?: "online" | "offline" | "busy";
  colorSeed?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = "",
  name = "Product",
  size = "md",
  shape = "circle",
  status,
  colorSeed,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeStyles = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };

  const statusSizeStyles = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-3.5 w-3.5",
  };

  const shapeStyles = {
    circle: "rounded-full",
    squircle: "rounded-[10px]",
  };

  // Extract initials
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Consistent background color palette based on name/seed
  const getAvatarGradient = (seed: string) => {
    const gradients = [
      "from-[#4F46E5] to-[#7E7EF6] text-white",
      "from-[#14142B] to-[#3A3A40] text-white",
      "from-[#0F8A5F] to-[#34D399] text-white",
      "from-[#7A4E00] to-[#FBBF24] text-white",
      "from-[#4338CA] to-[#4F46E5] text-white",
      "from-[#7C3AED] to-[#A78BFA] text-white",
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const statusStyles = {
    online: "bg-[#0F8A5F]",
    busy: "bg-[#F59E0B]",
    offline: "bg-[#55556E]",
  };

  return (
    <div className={cn("relative inline-flex shrink-0 select-none", className)} {...props}>
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden border border-[#E6E6F0] font-semibold tracking-tight ",
          sizeStyles[size],
          shapeStyles[shape],
          !src || imageError
            ? cn("bg-gradient-to-br", getAvatarGradient(colorSeed || name))
            : "bg-white"
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials || "P"}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
            statusSizeStyles[size],
            statusStyles[status]
          )}
        />
      )}
    </div>
  );
};

