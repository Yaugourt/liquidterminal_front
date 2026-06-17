import { cn } from "@/lib/utils";

/**
 * V4 loading-skeleton primitive — single source for placeholder shapes.
 *
 * Replaces the hand-rolled `animate-pulse` blocks scattered across pages
 * (wiki, ecosystem, …). Token-only (`bg-surface-2` shimmer) — never raw hex.
 *
 * - `<Skeleton>`     — base shimmer block (size it via className).
 * - `<SkeletonCard>` — card-shaped placeholder matching the V4 `<Card>`.
 * - `<SkeletonGrid>` — a responsive grid of `SkeletonCard`s (the grid + map
 *   boilerplate every loading state re-implements).
 */

interface SkeletonProps {
  className?: string;
}

/** Base shimmer block. Give it a size with `className` (`h-4 w-1/2`, …). */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-surface-2", className)}
    />
  );
}

interface SkeletonCardProps {
  /** Leading square avatar block (logo placeholder). Default `true`. */
  avatar?: boolean;
  /** Number of text lines rendered under the title line. Default `2`. */
  lines?: number;
  className?: string;
}

/**
 * Card-shaped placeholder — mirrors the V4 `<Card>` chrome
 * (`bg-surface border-border-subtle rounded-lg`) so the loading → loaded
 * swap doesn't shift the layout.
 */
export function SkeletonCard({ avatar = true, lines = 2, className }: SkeletonCardProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-surface border border-border-subtle rounded-lg p-3.5",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {avatar && <Skeleton className="w-12 h-12 shrink-0 rounded-lg" />}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  /** Number of placeholder cards. Default `6`. */
  count?: number;
  /** Tailwind `grid-cols-*` classes. Default responsive 1 / 2 / 3. */
  columns?: string;
  /** Gap class — match the real grid so nothing shifts. Default `gap-4`. */
  gap?: string;
  /** Forwarded to each `SkeletonCard`. */
  avatar?: boolean;
  lines?: number;
  className?: string;
}

/** Responsive grid of card placeholders for card-grid loading states. */
export function SkeletonGrid({
  count = 6,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  gap = "gap-4",
  avatar,
  lines,
  className,
}: SkeletonGridProps) {
  return (
    <div
      aria-busy="true"
      className={cn("grid", columns, gap, className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} avatar={avatar} lines={lines} />
      ))}
    </div>
  );
}
