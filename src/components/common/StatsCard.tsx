import { ReactNode, memo } from "react";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

type Density = "compact" | "comfortable";

interface DensityStyles {
    padding: string;
    iconBox: string;
    iconGap: string;
    labelSize: string;
    valueSize: string;
}

const DENSITY: Record<Density, DensityStyles> = {
    comfortable: {
        padding: "p-4",
        iconBox: "w-8 h-8",
        iconGap: "gap-3",
        labelSize: "text-[10px]",
        valueSize: "text-lg max-sm:text-[16px]",
    },
    compact: {
        padding: "p-3",
        iconBox: "w-7 h-7",
        iconGap: "gap-2",
        labelSize: "text-[9px]",
        valueSize: "text-sm",
    },
};

export interface StatsCardProps {
    /** Uppercase label above the value. */
    title: string;
    /** Main value (string or ReactNode for custom formatting). */
    value: string | number | ReactNode;
    /** Optional icon (rendered in a tinted square next to the label/value). */
    icon?: ReactNode;
    /**
     * Delta indicator next to the value. Two shapes:
     * - `number` → rendered as a trending pill: `+12.3%` or `-4.5%` (colored emerald/rose).
     * - `ReactNode` → custom badge (use for "+$12.3K", non-percentage deltas).
     */
    change?: number | ReactNode;
    /** Direction hint when `change` is a ReactNode. Drives the pill color. Ignored for numeric `change`. */
    changeDirection?: "up" | "down" | "neutral";
    /** Optional subline rendered under the value (e.g. "+$12.3K (24h)"). */
    subValue?: ReactNode;
    /** Right slot — appears in the top-right (e.g. info tooltip trigger). */
    headerAction?: ReactNode;
    /** Loading state — animates a placeholder where the value would render. */
    isLoading?: boolean;
    /** Cell padding + sizing preset. Defaults to `"comfortable"`. */
    density?: Density;
    /**
     * When `false`, renders as a bare `<div>` (no Card wrapper). Use inside an
     * existing Card / panel where another wrapper would double-up borders.
     */
    withCard?: boolean;
    /** Extra class on the outer wrapper. */
    className?: string;
    /** Class applied to the main value span (overrides default). */
    valueClassName?: string;
    /** Class applied to the label `<h3>` (overrides default). */
    titleClassName?: string;
    /** Class applied to the icon's tinted background square (e.g. `bg-gold/10` for accent variant). */
    iconClassName?: string;
}

function NumericChangePill({ change }: { change: number }) {
    if (!Number.isFinite(change)) return null;
    const positive = change >= 0;
    const Icon = positive ? TrendingUp : TrendingDown;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                positive
                    ? "bg-success/10 text-success"
                    : "bg-danger/10 text-danger"
            )}
        >
            <Icon className="w-2.5 h-2.5" />
            {positive ? "+" : ""}
            {change.toFixed(1)}%
        </span>
    );
}

export const StatsCard = memo(function StatsCard({
    title,
    value,
    icon,
    change,
    changeDirection,
    subValue,
    headerAction,
    isLoading,
    density = "comfortable",
    withCard = true,
    className,
    valueClassName,
    titleClassName,
    iconClassName,
}: StatsCardProps) {
    const ds = DENSITY[density];

    const content = (
        <div className={cn("flex items-start", ds.iconGap)}>
            {icon ? (
                <div className={cn(
                    "shrink-0 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                    ds.iconBox,
                    iconClassName ?? "bg-brand/10"
                )}>
                    {icon}
                </div>
            ) : null}
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className={cn(
                        "text-text-secondary font-semibold uppercase tracking-wider mb-2",
                        ds.labelSize,
                        titleClassName
                    )}>
                        {title}
                    </h3>
                    {headerAction && <div className="shrink-0">{headerAction}</div>}
                </div>
                {isLoading ? (
                    <Skeleton className="h-7 w-24 rounded" />
                ) : (
                    <>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span
                                className={cn(
                                    valueClassName ??
                                        cn(ds.valueSize, "text-text-primary font-bold tracking-tight tabular-nums")
                                )}
                            >
                                {value}
                            </span>
                            {typeof change === "number" ? (
                                <NumericChangePill change={change} />
                            ) : change ? (
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md",
                                        changeDirection === "up" && "bg-success/10 text-success",
                                        changeDirection === "down" && "bg-danger/10 text-danger",
                                        (changeDirection === "neutral" || !changeDirection) &&
                                            "bg-surface-2 text-text-secondary"
                                    )}
                                >
                                    {change}
                                </span>
                            ) : null}
                        </div>
                        {subValue && (
                            <div className="mt-0.5 text-[10px] leading-snug text-text-tertiary">
                                {subValue}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    if (!withCard) {
        return <div className={cn(ds.padding, className)}>{content}</div>;
    }

    return (
        <Card className={cn(ds.padding, className)}>
            {content}
        </Card>
    );
});

// Loading placeholder for StatsCard grid
export function StatsCardSkeleton() {
    return (
        <Card className="p-4 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />
        </Card>
    );
}
