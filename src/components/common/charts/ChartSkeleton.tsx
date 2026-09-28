"use client";

/**
 * ChartSkeleton - Loading placeholder for lazy-loaded chart components
 * Provides visual feedback while chart components are being loaded
 */
const SKELETON_BAR_HEIGHTS = [34, 52, 28, 46, 58, 38, 48];

export function ChartSkeleton({
    className = "",
    minHeight = "min-h-[300px]",
}: { className?: string; minHeight?: string }) {
    return (
        <div className={`w-full h-full ${minHeight} flex items-center justify-center ${className}`}>
            <div className="flex flex-col items-center gap-3">
                {/* Animated bars to simulate chart loading */}
                <div className="flex items-end gap-1 h-16">
                    {[...Array(7)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 bg-brand/30 rounded-t animate-pulse"
                            style={{
                                // Fixed heights: Math.random() here differed between the
                                // server render and hydration on every page using it.
                                height: `${SKELETON_BAR_HEIGHTS[i]}px`,
                                animationDelay: `${i * 100}ms`,
                            }}
                        />
                    ))}
                </div>
                <span className="text-xs text-text-tertiary">Loading chart...</span>
            </div>
        </div>
    );
}
