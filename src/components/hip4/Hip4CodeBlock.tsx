import { cn } from "@/lib/utils";

export function Hip4CodeBlock({
  children,
  className,
  title,
}: {
  children: string;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-black/40 overflow-hidden",
        className
      )}
    >
      {title ? (
        <div className="px-3 py-1.5 text-[11px] font-medium text-text-secondary border-b border-border-subtle bg-brand-tertiary/30">
          {title}
        </div>
      ) : null}
      <pre
        className="overflow-x-auto p-4 text-[12px] leading-relaxed font-mono text-zinc-200 scrollbar-thin max-h-[min(70vh,520px)]"
        tabIndex={0}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}
