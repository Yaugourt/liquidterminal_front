"use client";

import { ReactNode, useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useWindowSize } from "@/hooks/use-window-size";

interface ProjectsPageLayoutProps {
    children: ReactNode;
    headerTitle?: string;
    pageHeader?: ReactNode; // Title, Description, Stats, Action Button
    filters?: ReactNode;    // Tabs, Search Input
}

export function ProjectsPageLayout({
    children,
    headerTitle = "Public Goods",
    pageHeader,
    filters
}: ProjectsPageLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { width } = useWindowSize();

    useEffect(() => {
        if (width && width >= 1024) {
            setIsSidebarOpen(false);
        }
    }, [width]);

    return (
        <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
            {/* Mobile menu button */}
            <div className="fixed top-4 left-4 z-50 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="">
                {/* Header with glass effect */}
                <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
                    <Header customTitle={headerTitle} showFees={true} />
                </div>

                {/* Mobile search bar */}
                <div className="p-2 lg:hidden">
                    <SearchBar placeholder="Search projects..." />
                </div>

                <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
                    {/* Header section (Title, Desc, Stats, CTA) */}
                    {pageHeader && (
                        <div className="space-y-4">
                            {pageHeader}
                        </div>
                    )}

                    {/* Filters (Tabs, Search) */}
                    {filters && (
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            {filters}
                        </div>
                    )}

                    {/* Main Content (Grid) */}
                    {children}
                </main>
            </div>
        </div>
    );
}
