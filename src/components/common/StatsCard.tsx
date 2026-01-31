import { ReactNode, memo } from "react";
import { Loader2 } from "lucide-react";

export interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    change?: number;
    isLoading?: boolean;
    className?: string;
}

export const StatsCard = memo(function StatsCard({
    title,
    value,
    icon,
    change,
    isLoading,
    className
}: StatsCardProps) {
    return (
        <div className={`glass-panel p-4 hover:border-border-hover transition-all group ${className || ''}`}>
            <div className="flex items-center gap-3 mb-2">
                {icon && (
                    <div className="w-8 h-8 rounded-xl bg-brand-accent/10 flex items-center justify-center transition-transform group-hover:scale-110">
                        {icon}
                    </div>
                )}
                <h3 className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider">
                    {title}
                </h3>
            </div>

            {isLoading ? (
                <div className="h-7 bg-white/5 animate-pulse rounded w-24" />
            ) : (
                <div className="flex items-baseline gap-2">
                    <span className="text-lg max-sm:text-[16px] text-white font-bold tracking-tight">
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
    );
});

// Loading placeholder for StatsCard grid
export function StatsCardSkeleton() {
    return (
        <div className="glass-panel p-4 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white/20 animate-spin" />
        </div>
    );
}
