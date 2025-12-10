"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TokenIconProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "w-5 h-5",
    image: 20,
    text: "text-[8px]"
  },
  md: {
    container: "w-6 h-6",
    image: 24,
    text: "text-xs"
  },
  lg: {
    container: "w-8 h-8",
    image: 32,
    text: "text-sm"
  }
};

const variants = {
  light: {
    bg: "bg-white",
    text: "text-black",
    border: "border-white/20"
  },
  dark: {
    bg: "bg-brand-tertiary",
    text: "text-brand-accent",
    border: "border-[#83E9FF33]"
  }
};

export function TokenIcon({ 
  src, 
  name,
  size = "md",
  variant = "dark",
  className
}: TokenIconProps) {
  const [hasError, setHasError] = useState(false);
  const sizeClass = sizeClasses[size];
  const variantClass = variants[variant];
  const firstLetter = name.charAt(0).toUpperCase();

  if (!src || hasError) {
    return (
      <div className={cn(
        sizeClass.container,
        variantClass.bg,
        variantClass.text,
        variantClass.border,
        "rounded-full border flex items-center justify-center font-medium",
        variant === "dark" && "shadow-[0_0_8px_rgba(131,233,255,0.08)]",
        className
      )}>
        {firstLetter}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={sizeClass.image}
      height={sizeClass.image}
      className={cn(
        sizeClass.container,
        "rounded-full border",
        variantClass.border,
        variant === "dark" && "shadow-[0_0_8px_rgba(131,233,255,0.15)]",
        "backdrop-blur-sm object-contain",
        className
      )}
      onError={() => setHasError(true)}
      unoptimized
    />
  );
} 