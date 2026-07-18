import { JsonLd } from "@/components/JsonLd";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
}

interface PageFaqProps {
  items: FaqItem[];
  title?: string;
  className?: string;
}

/**
 * Crawlable FAQ block with FAQPage JSON-LD. Native `<details>` so answers sit
 * in the initial HTML (readable by crawlers that never run JS) while staying
 * collapsed visually. Answers are plain strings: the schema markup and the
 * visible copy can never diverge.
 */
export function PageFaq({ items, title = "FAQ", className }: PageFaqProps) {
  if (items.length === 0) return null;
  return (
    <section
      className={cn(
        "bg-surface border border-border-subtle rounded-lg overflow-hidden",
        className
      )}
    >
      <h2 className="text-[14px] font-semibold text-text-primary px-4 pt-3.5 pb-1.5">
        {title}
      </h2>
      <div className="px-1.5 pb-2">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 px-2.5 py-2.5 rounded-md text-[13px] text-text-primary hover:bg-surface-2/60 transition-colors">
              <span>{item.q}</span>
              <span
                aria-hidden
                className="text-text-tertiary text-[13px] shrink-0 transition-transform group-open:rotate-90"
              >
                ›
              </span>
            </summary>
            <p className="px-2.5 pb-3 pt-0.5 text-[13px] leading-relaxed text-text-secondary max-w-[72ch]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
    </section>
  );
}
