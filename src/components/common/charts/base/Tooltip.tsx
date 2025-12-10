"use client";

interface BaseTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string | number;
  formatValue?: (value: number) => string;
  formatTime?: (time: string | number) => string;
  suffix?: string;
}

export function BaseTooltip({
  active,
  payload,
  label,
  formatValue = (value) => value.toString(),
  formatTime = (time) => new Date(time).toLocaleString(),
  suffix = ""
}: BaseTooltipProps) {
  if (active && payload && payload.length > 0 && label) {
    return (
      <div className="bg-brand-tertiary border border-[#83E9FF4D] p-2 rounded">
        <p className="text-white text-xs">
          {formatTime(label)}
        </p>
        <p className="text-brand-accent font-medium">
          {formatValue(payload[0].value)}{suffix}
        </p>
      </div>
    );
  }
  return null;
} 