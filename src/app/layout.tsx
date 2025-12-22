import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { SITE_CONFIG } from "@/lib/site-config";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "Liquid Terminal - HyperLiquid Data Platform & Services",
    template: "%s | Liquid Terminal"
  },
  description: "Comprehensive data processing platform for the HyperLiquid ecosystem. Free tools for HyperCore & HyperEVM: Explorer, Market tracking, Ecosystem overview, Wiki. Premium products: API, RPC, Tracker, DCA.",
  keywords: [
    "HyperLiquid",
    "HyperCore",
    "HyperEVM",
    "crypto explorer",
    "blockchain data",
    "DeFi platform",
    "market tracker",
    "crypto API",
    "RPC node",
    "DCA bot",
    "public goods",
    "open source crypto"
  ],
  authors: [{ name: "Liquid Terminal Team" }],
  creator: "Liquid Terminal",
  publisher: "Liquid Terminal",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: "Liquid Terminal",
    title: "Liquid Terminal - HyperLiquid Data Platform",
    description: "Complete data processing platform for the HyperLiquid ecosystem. Free tools and premium services for HyperCore & HyperEVM.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Liquid Terminal Platform",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@liquidterminal",
    creator: "@liquidterminal",
    title: "Liquid Terminal - HyperLiquid Platform",
    description: "Data platform for HyperLiquid ecosystem - Free tools & premium services",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-brand-main`}>
        <Providers>
          {children}
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
