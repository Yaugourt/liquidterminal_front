"use client";

/**
 * ChartSkeleton - Loading placeholder for lazy-loaded chart components
 * Provides visual feedback while chart components are being loaded
 */
export function ChartSkeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`w-full h-full min-h-[300px] flex items-center justify-center ${className}`}>
            <div className="flex flex-col items-center gap-3">
                {/* Animated bars to simulate chart loading */}
                <div className="flex items-end gap-1 h-16">
                    {[...Array(7)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 bg-brand-accent/30 rounded-t animate-pulse"
                            style={{
                                height: `${20 + Math.random() * 40}px`,
                                animationDelay: `${i * 100}ms`,
                            }}
                        />
                    ))}
                </div>
                <span className="text-xs text-text-muted">Loading chart...</span>
            </div>
        </div>
    );
}
