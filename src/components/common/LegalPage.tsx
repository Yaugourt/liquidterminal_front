import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: ReactNode;
}

export function LegalPage({ title, lastUpdated, intro, children }: LegalPageProps) {
  return (
    <article>
      <header className="mb-10 pb-8 border-b border-border-subtle">
        <p className="text-xs uppercase tracking-wider text-text-tertiary mb-2">Legal</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-text-primary mb-3">{title}</h1>
        <p className="text-xs text-text-tertiary mono">Last updated: {lastUpdated}</p>
        {intro && (
          <p className="mt-5 text-sm text-text-secondary leading-relaxed">{intro}</p>
        )}
      </header>

      <div className="space-y-8 text-sm text-text-secondary leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:first:mt-0 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-text-primary [&_h3]:mb-2 [&_h3]:mt-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:my-3 [&_a]:text-brand [&_a]:underline [&_a]:decoration-brand/30 hover:[&_a]:decoration-brand [&_strong]:text-text-primary [&_strong]:font-semibold [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
        {children}
      </div>
    </article>
  );
}
