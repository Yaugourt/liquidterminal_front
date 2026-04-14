import { ReactNode, memo } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    change?: number;
    isLoading?: boolean;
    className?: string;
    /** Applied to the main value span (default: white bold). */
    valueClassName?: string;
}

export const StatsCard = memo(function StatsCard({
    title,
    value,
    icon,
    change,
    isLoading,
    className,
    valueClassName,
}: StatsCardProps) {
    return (
        <Card className={`p-4 ${className || ''}`}>
            <div className="flex items-center gap-3">
                {icon ? (
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                        {icon}
                    </div>
                ) : null}
                <div className="min-w-0 flex-1">
                    <h3 className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mb-2">
                        {title}
                    </h3>
                    {isLoading ? (
                        <div className="h-7 bg-white/5 animate-pulse rounded w-24" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span
                                className={
                                    valueClassName ??
                                    "text-lg max-sm:text-[16px] text-white font-bold tracking-tight"
                                }
                            >
                                {value}
                            </span>
                            {change !== undefined && (
                                <span
                                    className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${change >= 0
                                        ? "bg-brand-accent/10 text-brand-accent"
                                        : "bg-rose-500/20 text-rose-400"
                                        }`}
                                >
                                    {change >= 0 ? "+" : ""}
                                    {change}%
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
});

// Loading placeholder for StatsCard grid
export function StatsCardSkeleton() {
    return (
        <Card className="p-4 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
        </Card>
    );
}
