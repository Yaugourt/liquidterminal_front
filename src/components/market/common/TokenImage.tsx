import { useState } from "react";
import Image from "next/image";

interface TokenImageProps {
  src: string | null;
  alt: string;
  size?: "sm" | "md";
}

const sizes = {
  sm: {
    container: "w-5 h-5",
    text: "text-xs",
  },
  md: {
    container: "w-8 h-8",
    text: "text-sm",
  },
};

export function TokenImage({ src, alt, size = "sm" }: TokenImageProps) {
  const [hasError, setHasError] = useState(false);
  const { container, text } = sizes[size];

  if (!src || hasError) {
    return (
      <div className={`${container} rounded-full bg-[#051728] border border-[#83E9FF33] flex items-center justify-center shadow-[0_0_8px_rgba(131,233,255,0.08)]`}>
        <span className={`text-[#83E9FF] ${text} font-medium`}>
          {alt.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size === "sm" ? 20 : 32}
      height={size === "sm" ? 20 : 32}
      className={`${container} rounded-full border border-[#83E9FF33] shadow-[0_0_8px_rgba(131,233,255,0.15)] backdrop-blur-sm object-contain`}
      onError={() => setHasError(true)}
      unoptimized
    />
  );
} 