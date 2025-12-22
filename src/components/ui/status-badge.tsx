import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
    "inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-white/5 text-text-secondary ring-white/10",
                success:
                    "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
                error:
                    "bg-rose-500/10 text-rose-400 ring-rose-500/20",
                warning:
                    "bg-amber-500/10 text-amber-400 ring-amber-500/20",
                info:
                    "bg-brand-accent/10 text-brand-accent ring-brand-accent/20",
                buy:
                    "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
                sell:
                    "bg-rose-500/10 text-rose-400 ring-rose-500/20",
                neutral:
                    "bg-zinc-500/10 text-text-secondary ring-zinc-500/20",
                active:
                    "bg-brand-accent/10 text-brand-accent ring-brand-accent/20",
                inactive:
                    "bg-zinc-500/10 text-text-muted ring-zinc-500/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> { }

function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
    return (
        <div className={cn(statusBadgeVariants({ variant }), className)} {...props} />
    )
}

export { StatusBadge, statusBadgeVariants }
