import { ReactNode, memo } from "react";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { cn } from "@/lib/utils";

type IconVariant = "accent" | "gold";

const ICON_BG: Record<IconVariant, string> = {
    accent: "bg-brand-accent/10",
    gold: "bg-brand-gold/10",
};

export interface StatsPanelProps {
    /** Header title (uppercase). */
    title: string;
    /** Icon shown in a tinted square next to the title. */
    icon?: ReactNode;
    /** Icon background tint. Defaults to `"accent"`. Ignored if `iconClassName` is set. */
    iconVariant?: IconVariant;
    /** Custom class on the icon's tinted square (overrides `iconVariant`). */
    iconClassName?: string;
    /** Right-aligned slot in the header (period selector, refresh button, etc.). */
    headerAction?: ReactNode;
    /** Replaces the body with `<LoadingState>`. */
    isLoading?: boolean;
    /** Replaces the body with `<ErrorState>`. */
    error?: Error | null;
    /** Title for the error state. Defaults to "An error occurred". */
    errorTitle?: string;
    /** Panel body — typically a grid of stats. */
    children: ReactNode;
    /** Extra class on the wrapping `<Card>`. */
    className?: string;
    /** Extra class on the body wrapper (around `children`). */
    bodyClassName?: string;
}

/**
 * Canonical panel for grouping multiple stats under a header (icon + title).
 * Use `<StatsCard withCard={false}>` inside for each stat. Pair with `headerAction`
 * for period selectors / refresh buttons.
 *
 * For a single stat card in a grid, use `<StatsCard>` directly.
 */
export const StatsPanel = memo(function StatsPanel({
    title,
    icon,
    iconVariant = "accent",
    iconClassName,
    headerAction,
    isLoading,
    error,
    errorTitle = "An error occurred",
    children,
    className,
    bodyClassName,
}: StatsPanelProps) {
    return (
        <Card className={cn("p-4 h-full flex flex-col", className)}>
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            iconClassName ?? ICON_BG[iconVariant]
                        )}>
                            {icon}
                        </div>
                    )}
                    <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
                        {title}
                    </h3>
                </div>
                {headerAction && <div className="shrink-0">{headerAction}</div>}
            </div>

            {error ? (
                <ErrorState title={errorTitle} withCard={false} />
            ) : isLoading ? (
                <LoadingState message="" size="sm" withCard={false} />
            ) : (
                <div className={cn("flex-1", bodyClassName)}>{children}</div>
            )}
        </Card>
    );
});
