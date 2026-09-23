"use client";

/**
 * ChartSkeleton - Loading placeholder for lazy-loaded chart components
 * Provides visual feedback while chart components are being loaded
 */
// Fixed bar heights (px): Math.random() differed between the server render
// and hydration, which React reports as a hydration mismatch.
const BAR_HEIGHTS = [34, 26, 48, 38, 56, 30, 44];

export function ChartSkeleton({
    className = "",
    minHeight = "min-h-[300px]",
}: { className?: string; minHeight?: string }) {
    return (
        <div className={`w-full h-full ${minHeight} flex items-center justify-center ${className}`}>
            <div className="flex flex-col items-center gap-3">
                {/* Animated bars to simulate chart loading */}
                <div className="flex items-end gap-1 h-16">
                    {BAR_HEIGHTS.map((h, i) => (
                        <div
                            key={i}
                            className="w-2 bg-brand/30 rounded-t animate-pulse"
                            style={{
                                height: `${h}px`,
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
