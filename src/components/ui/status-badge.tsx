import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * StatusBadge — the one pill for statuses, sides and flags (kit.html
 * "StatusBadge / pills"). 11px, tinted fill + hairline border of the same tone.
 * Use it for Long/Short (`buy`/`sell`), Open/Closed, method tags… inside table
 * cells too — never hand-roll `px-2 py-1 rounded` badges.
 */
const statusBadgeVariants = cva(
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium leading-4 transition-colors",
    {
        variants: {
            variant: {
                default: "bg-surface-2 text-text-secondary border-border-subtle",
                neutral: "bg-surface-2 text-text-secondary border-border-subtle",
                inactive: "bg-surface-2 text-text-tertiary border-border-subtle",
                success: "bg-success/10 text-success border-success/25",
                buy: "bg-success/10 text-success border-success/25",
                error: "bg-danger/10 text-danger border-danger/25",
                sell: "bg-danger/10 text-danger border-danger/25",
                warning: "bg-warning/10 text-warning border-warning/25",
                gold: "bg-gold/10 text-gold border-gold/25",
                info: "bg-brand/10 text-brand border-brand/25",
                active: "bg-brand/10 text-brand border-brand/25",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const DOT_TONE: Record<NonNullable<VariantProps<typeof statusBadgeVariants>["variant"]>, string> = {
    default: "bg-text-tertiary",
    neutral: "bg-text-tertiary",
    inactive: "bg-text-tertiary",
    success: "bg-success",
    buy: "bg-success",
    error: "bg-danger",
    sell: "bg-danger",
    warning: "bg-warning",
    gold: "bg-gold",
    info: "bg-brand",
    active: "bg-brand",
}

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
    /** Leading status dot in the badge's tone (Open / Closed style). */
    dot?: boolean
}

function StatusBadge({ className, variant, dot = false, children, ...props }: StatusBadgeProps) {
    return (
        <span className={cn(statusBadgeVariants({ variant }), className)} {...props}>
            {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_TONE[variant ?? "default"])} />}
            {children}
        </span>
    )
}

export { StatusBadge, statusBadgeVariants }
