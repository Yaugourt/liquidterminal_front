import type { ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  danger: {
    wrap: "border-red-500/25 bg-red-500/5",
    icon: AlertTriangle,
    iconClass: "text-red-400",
    titleClass: "text-white",
  },
  emphasis: {
    wrap: "border-brand-gold/25 bg-brand-gold/[0.06]",
    icon: Info,
    iconClass: "text-brand-gold",
    titleClass: "text-brand-gold",
  },
} as const;

export function Hip4Callout({
  variant,
  title,
  children,
  className,
}: {
  variant: keyof typeof variants;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const v = variants[variant];
  const Icon = v.icon;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-xs leading-relaxed text-text-secondary",
        v.wrap,
        className
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", v.iconClass)} aria-hidden />
      <div>
        <strong className={cn("font-semibold", v.titleClass)}>{title}</strong>
        <div className="mt-1.5 space-y-2">{children}</div>
      </div>
    </div>
  );
}
