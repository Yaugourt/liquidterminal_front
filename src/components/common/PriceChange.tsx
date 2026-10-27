import { cn } from "@/lib/utils";

interface PriceChangeProps {
  value: number;
  className?: string;
  showIcon?: boolean;
  prefix?: string;
  suffix?: string;
}

// `+` on positives, and no "-0.00" when a tiny negative rounds to zero.
function formatSigned(value: number, decimals: number): string {
  const text = value.toFixed(decimals);
  const unsigned = Number(text) === 0 ? text.replace('-', '') : text;
  return `${value > 0 ? '+' : ''}${unsigned}`;
}

export function PriceChange({ 
  value, 
  className,
  showIcon = false,
  prefix = "",
  suffix = "%"
}: PriceChangeProps) {
  // Détermine la couleur en fonction de la valeur
  const getColorClass = (change: number) => {
    if (change > 0) return "text-success"; // Vert
    if (change < 0) return "text-danger"; // Rouge
    return "text-text-primary";
  };

  // Formate le nombre avec le signe et 2 décimales
  const formattedValue = formatSigned(value, 2);

  return (
    <div className={cn("flex items-center gap-1", getColorClass(value), className)}>
      {showIcon && (
        <svg
          className={cn(
            "w-3 h-3",
            value > 0 ? "rotate-0" : value < 0 ? "rotate-180" : "hidden"
          )}
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 0.5L10 5.5L0 5.5L5 0.5Z"
            fill="currentColor"
          />
        </svg>
      )}
      <span>
        {prefix}{formattedValue}{suffix}
      </span>
    </div>
  );
}

export function getPriceChangeColor(value: number): string {
  if (value > 0) return "text-success"; // Vert
  if (value < 0) return "text-danger"; // Rouge
  return "text-text-primary";
}

export function formatPriceChange(value: number, decimals: number = 2): string {
  return `${formatSigned(value, decimals)}%`;
} 