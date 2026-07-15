import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Internal design mockups: keep out of search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  // Design sandboxes are dev-only: hide the whole /labs subtree in production.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return children;
}
