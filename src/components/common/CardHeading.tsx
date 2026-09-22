import { type ReactNode, type ElementType } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CardHeading — the shared V4 analytic card-head.
 *
 * Extracted from `OverviewModule` so specialized cards and card-mode tables
 * consume one head instead of re-declaring the markup. Anatomy (compact):
 * 14px horizontal / 10px vertical padding, 13px/600 title, 44px min height
 * (never a max), 24px icon block. The head never fetches data — pass a ready
 * `status` node (e.g. `DataStatus`) into its slot.
 *
 * Layout stays a single wrapping flex row so a narrow card drops the meta and
 * link to a second line instead of squeezing the title to an ellipsis. Exactly
 * one right-cluster element carries `ml-auto` (the first present of
 * plain-meta / status / actions / link) so the cluster pins right without the
 * free space splitting between several auto margins.
 */

export interface CardHeadingProps {
  /** Required. Text or a React node; stays a semantic title. */
  title: ReactNode;
  /** Heading element. Chosen by the page context; defaults to `h3`. */
  titleAs?: ElementType;
  /** Optional brand icon left of the title. No empty slot when absent. */
  icon?: ReactNode;
  /** Secondary info (tag, scope). Omitted cleanly when absent. */
  meta?: ReactNode;
  /** `pill` (default) sits inline after the title; `plain` right-aligns as muted text. */
  metaVariant?: "pill" | "plain";
  /** Optional secondary line under the title (units, context). */
  description?: ReactNode;
  /** Slot for a ready state node (`DataStatus`, live dot). The head fetches nothing. */
  status?: ReactNode;
  /** Card-level controls, kept in their given order. No one-button limit. */
  actions?: ReactNode;
  /** Optional trailing "View all →" link. */
  href?: string;
  /** Label for the `href` link. */
  viewAllLabel?: string;
  /** Head padding. `compact` (default) matches the analytic module head. */
  density?: "compact" | "comfortable";
  /** Bottom separator between head and body. Default true. */
  divider?: boolean;
  className?: string;
}

const densityPad = {
  compact: "px-3.5 py-2.5",
  comfortable: "px-4 py-3",
} as const;

export function CardHeading({
  title,
  titleAs: TitleTag = "h3",
  icon,
  meta,
  metaVariant = "pill",
  description,
  status,
  actions,
  href,
  viewAllLabel,
  density = "compact",
  divider = true,
  className,
}: CardHeadingProps) {
  const hasPlainMeta = meta != null && metaVariant === "plain";
  // Exactly one right-cluster element gets `ml-auto`: the first one present.
  const metaMlAuto = hasPlainMeta;
  const statusMlAuto = !hasPlainMeta;
  const actionsMlAuto = !hasPlainMeta && !status;
  const linkMlAuto = !hasPlainMeta && !status && !actions;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2.5 min-h-[44px]",
        densityPad[density],
        divider && "border-b border-border-subtle",
        className,
      )}
    >
      {icon && (
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          {icon}
        </span>
      )}

      {description != null ? (
        <div className="min-w-0 flex flex-col gap-0.5">
          <TitleTag className="text-[13px] font-semibold text-text-primary truncate">
            {title}
          </TitleTag>
          <span className="text-[11px] text-text-secondary truncate">{description}</span>
        </div>
      ) : (
        <TitleTag className="text-[13px] font-semibold text-text-primary truncate">
          {title}
        </TitleTag>
      )}

      {meta != null && metaVariant === "pill" && (
        <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          {meta}
        </span>
      )}
      {meta != null && metaVariant === "plain" && (
        <span className={cn("shrink-0 text-[11px] text-text-tertiary", metaMlAuto && "ml-auto")}>
          {meta}
        </span>
      )}
      {status && (
        <span className={cn("shrink-0 flex items-center", statusMlAuto && "ml-auto")}>
          {status}
        </span>
      )}
      {actions && (
        <span className={cn("shrink-0 flex items-center gap-1", actionsMlAuto && "ml-auto")}>
          {actions}
        </span>
      )}
      {href && (
        <Link
          href={href}
          className={cn(
            "shrink-0 flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors",
            linkMlAuto && "ml-auto",
          )}
        >
          {viewAllLabel ?? "View all"}
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}
