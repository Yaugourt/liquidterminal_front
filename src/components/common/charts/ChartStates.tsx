"use client";

import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";

interface ChartLoadingProps {
  className?: string;
}

export function ChartLoading({ className = "" }: ChartLoadingProps) {
  return (
    <div className={`flex flex-col justify-end items-center h-full min-h-[200px] p-4 ${className}`}>
      <div className="w-full flex items-end justify-center gap-[3px] h-[60%] max-w-[280px]">
        {[35, 55, 40, 70, 50, 80, 45, 65, 55, 75, 42, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-white/[0.04] animate-pulse"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 80}ms`,
              animationDuration: "1.5s",
            }}
          />
        ))}
      </div>
      <div className="h-[1px] w-full max-w-[280px] bg-white/[0.06] mt-1" />
      <span className="text-[10px] text-text-muted mt-3 tracking-wide">Loading...</span>
    </div>
  );
}

interface ChartEmptyProps {
  message?: string;
  suggestion?: string;
  className?: string;
}

export function ChartEmpty({
  message = "No data available",
  suggestion,
  className = "",
}: ChartEmptyProps) {
  return (
    <div className={`flex flex-col justify-center items-center h-full min-h-[200px] gap-2 ${className}`}>
      <BarChart3 className="h-8 w-8 text-white/[0.08]" strokeWidth={1.5} />
      <p className="text-text-muted text-sm">{message}</p>
      {suggestion && (
        <p className="text-text-muted/60 text-xs">{suggestion}</p>
      )}
    </div>
  );
}

interface ChartErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ChartError({
  message = "Failed to load chart data",
  onRetry,
  className = "",
}: ChartErrorProps) {
  return (
    <div className={`flex flex-col justify-center items-center h-full min-h-[200px] gap-3 ${className}`}>
      <AlertCircle className="h-6 w-6 text-rose-400" />
      <p className="text-rose-400 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-border-subtle transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  );
}
