"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ExplorerSearchBar } from "@/components/explorer/ExplorerSearchBar";
import { SidebarToggle } from "@/components/common";
import { useWindowSize } from "@/hooks/use-window-size";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { width } = useWindowSize();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (width && width >= 1024) {
            setIsSidebarOpen(false);
        }
    }, [width]);

    return (
        <div className="min-h-screen bg-brand-main text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-secondary via-brand-main to-black">            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <SidebarToggle onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="lg:pl-[220px]">
                {/* Header - scrolls with page content */}
                <div>
                    <Header />
                </div>

                {/* Mobile SearchBar */}
                <div className="p-2 lg:hidden">
                    <ExplorerSearchBar placeholder="Search..." />
                </div>

                <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
