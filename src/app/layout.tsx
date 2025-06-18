import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Liquid Terminal",
  description: "Liquid Terminal - Hyperliquid terminal",
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" }
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#112941]`}>
        <Providers>
          <div className="lg:pl-[220px] relative">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
