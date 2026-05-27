import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="relative z-10 mt-16 border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-tertiary">
        <p>© {new Date().getFullYear()} Liquid Terminal. All rights reserved.</p>
        <nav className="flex items-center gap-1">
          <Link href="/legal/terms" className="px-2.5 py-1 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors">Terms</Link>
          <span className="text-text-tertiary/50">·</span>
          <Link href="/legal/privacy" className="px-2.5 py-1 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors">Privacy</Link>
          <span className="text-text-tertiary/50">·</span>
          <Link href="/legal/disclaimer" className="px-2.5 py-1 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors">Disclaimer</Link>
        </nav>
      </div>
    </footer>
  );
}
