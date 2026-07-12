import type { Metadata } from "next";

// Internal design mockups: keep out of search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
