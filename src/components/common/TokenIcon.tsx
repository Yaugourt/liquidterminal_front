"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface TokenIconProps {
  logo?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6"
};

export const TokenIcon = memo(function TokenIcon({ 
  logo, 
  name,
  size = "md",
  className
}: TokenIconProps) {
  const firstLetter = name.charAt(0).toUpperCase();
  const sizeClass = sizeClasses[size];

  if (logo) {
    return (
      <img 
        src={logo} 
        alt={name} 
        className={cn(
          sizeClass,
          "rounded object-contain",
          className
        )} 
      />
    );
  }

  return (
    <div className={cn(
      sizeClass,
      "rounded flex items-center justify-center bg-white text-black font-medium",
      className
    )}>
      {firstLetter}
    </div>
  );
}); 