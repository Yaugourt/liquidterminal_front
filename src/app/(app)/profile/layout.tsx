import type { Metadata } from "next";

// Personal account page: keep out of search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
