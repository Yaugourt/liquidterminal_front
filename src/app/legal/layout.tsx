import Link from "next/link";
import type { ReactNode } from "react";
import { LegalFooter, LiquidMark } from "@/components/common";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-base text-text-primary font-inter">
      <header className="relative z-10 sticky top-0 bg-base/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-text-primary hover:text-brand transition-colors">
            <LiquidMark size={24} decorative />
            <span className="font-medium text-sm">Liquid Terminal</span>
          </Link>
          <nav className="flex items-center gap-1 text-xs text-text-tertiary">
            <Link href="/legal/terms" className="px-2.5 py-1 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="px-2.5 py-1 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors">Privacy</Link>
            <Link href="/legal/disclaimer" className="px-2.5 py-1 rounded-md hover:bg-surface-2 hover:text-text-primary transition-colors">Disclaimer</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-16">
        {children}
      </main>

      <LegalFooter />
    </div>
  );
}
