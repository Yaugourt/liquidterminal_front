"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Turn a card into something citable.
 *
 * A dashboard cannot be screenshotted without losing what it claims: crop it
 * and the context goes, keep it whole and the point is buried. `src` should
 * point at a tile route under `/api/tile/*` that renders the same figures as
 * one self-contained frame, headline and method and source included.
 *
 * Clicking copies that image straight to the clipboard so it can be pasted
 * into a post. Clipboard image writes are Chromium-only in practice, so a
 * failure falls back to a download rather than leaving the user with nothing.
 */
interface ShareTileProps {
  /** Tile endpoint, e.g. `/api/tile/revenue?window=30d`. */
  src: string;
  /** Basename used when the clipboard path is unavailable. */
  filename: string;
  /** Screen-reader label; also the tooltip. */
  label?: string;
  className?: string;
}

type State = "idle" | "working" | "done";

export function ShareTile({ src, filename, label = "Copy as image", className }: ShareTileProps) {
  const [state, setState] = useState<State>("idle");

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClick = async () => {
    if (state === "working") return;
    setState("working");
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`tile route returned ${response.status}`);
      const blob = await response.blob();

      try {
        // ClipboardItem must be constructed synchronously with the blob for
        // Safari, which is also the browser most likely to reject the write.
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("Image copied — paste it in your post");
      } catch {
        download(blob);
        toast.success("Image downloaded");
      }

      setState("done");
      window.setTimeout(() => setState("idle"), 2000);
    } catch {
      toast.error("Could not render the image");
      setState("idle");
    }
  };

  // A 12px icon button is too small for a spinner primitive; the pending state
  // reads as a dimmed, non-interactive icon instead.
  const Icon = state === "done" ? Check : Share2;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "working"}
      title={label}
      aria-label={label}
      aria-busy={state === "working"}
      className={cn(
        "w-6 h-6 rounded-md grid place-items-center shrink-0 transition-colors",
        "text-text-tertiary hover:text-text-primary hover:bg-surface-2",
        state === "working" && "opacity-40 pointer-events-none",
        state === "done" && "text-brand",
        className
      )}
    >
      <Icon size={12} />
    </button>
  );
}
