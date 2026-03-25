import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Hip4ChapterShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-inter text-sm text-zinc-300 leading-relaxed space-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Hip4SectionTitle({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "text-xs font-bold uppercase tracking-wider text-text-secondary mb-3",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Hip4GlassPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-brand-secondary/40 p-5 sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
