"use client";

import { ReactNode } from "react";

interface ProjectsLayoutProps {
    children: ReactNode;
    headerTitle?: string;
    pageHeader?: ReactNode; // Title, Description, Stats, Action Button
    filters?: ReactNode;    // Tabs, Search Input
}

export function ProjectsLayout({
    children,
    pageHeader,
    filters
}: ProjectsLayoutProps) {
    return (
        <>
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
        </>
    );
}
