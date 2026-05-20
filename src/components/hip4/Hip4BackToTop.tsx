"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TOP_ID = "hip4-doc-top";
const SHOW_AFTER = 400;

export function Hip4BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href={`#${TOP_ID}`}
      className={cn(
        "fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full",
        "border border-border-default bg-surface/90 text-brand shadow-lg",
        "transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </a>
  );
}
