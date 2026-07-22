"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ExplorerSearchBar } from "@/components/explorer/ExplorerSearchBar";
import { SidebarToggle, LegalFooter } from "@/components/common";
import { useWindowSize } from "@/hooks/use-window-size";
import { useSidebarUi } from "@/store/use-sidebar-ui";
import { OnboardingGate } from "@/components/onboarding";
import { MissionsGate } from "@/components/missions";
import { Providers } from "@/components/Providers";
import { GlobalSearchPalette } from "@/components/search/GlobalSearchPalette";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { width } = useWindowSize();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { collapsed } = useSidebarUi();
    const [hasMounted, setHasMounted] = useState(false);
    // Transitions stay disabled on first paint so a persisted collapsed
    // state doesn't replay the collapse animation on every page load.
    const [animReady, setAnimReady] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        const t = setTimeout(() => setAnimReady(true), 150);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (width && width >= 1024) {
            setIsSidebarOpen(false);
        }
    }, [width]);

    // Content offset follows the sidebar width (56px rail / 232px panel).
    // Gated on hasMounted so SSR markup matches the first client render.
    const isCollapsed = hasMounted && collapsed;

    return (
        <Providers>
        <div className="min-h-screen bg-base text-text-primary font-inter">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <SidebarToggle onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className={cn(
                "relative z-10 transition-[padding] duration-200 ease-out",
                !animReady && "sidebar-no-anim",
                isCollapsed ? "lg:pl-14" : "lg:pl-[232px]"
            )}>
                <Header />

                {/* Mobile SearchBar */}
                <div className="p-2 lg:hidden">
                    <ExplorerSearchBar placeholder="Search..." />
                </div>

                <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
                    {children}
                </main>

                <LegalFooter />
            </div>

            <OnboardingGate />
            <MissionsGate />
            <GlobalSearchPalette />
        </div>
        </Providers>
    );
}
