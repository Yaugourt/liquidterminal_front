import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
    "inline-flex items-center rounded-md px-2 py-1 font-bold ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "bg-surface-2 text-text-secondary ring-border-subtle",
                success:
                    "bg-success/10 text-success ring-success/20",
                error:
                    "bg-danger/10 text-danger ring-danger/20",
                warning:
                    "bg-warning/10 text-warning ring-warning/20",
                info:
                    "bg-brand/10 text-brand ring-brand/20",
                buy:
                    "bg-success/10 text-success ring-success/20",
                sell:
                    "bg-danger/10 text-danger ring-danger/20",
                neutral:
                    "bg-surface-2 text-text-secondary ring-border-subtle",
                active:
                    "bg-brand/10 text-brand ring-brand/20",
                inactive:
                    "bg-surface-2 text-text-tertiary ring-border-subtle",
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
