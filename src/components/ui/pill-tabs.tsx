"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type TabOption = {
    value: string
    label: React.ReactNode
}

interface PillTabsProps {
    tabs: TabOption[]
    activeTab: string
    onTabChange: (value: string) => void
    layoutId?: string
    className?: string
}

export function PillTabs({
    tabs,
    activeTab,
    onTabChange,
    layoutId = "pill-tab",
    className
}: PillTabsProps) {
    return (
        <div className={cn("flex items-center gap-1 p-1 bg-black/20 rounded-lg w-fit", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.value

                return (
                    <button
                        key={tab.value}
                        onClick={() => onTabChange(tab.value)}
                        className={cn(
                            "relative px-4 py-1.5 text-sm font-medium transition-colors rounded-md z-10",
                            isActive ? "text-black" : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId={layoutId}
                                className="absolute inset-0 bg-[#83E9FF] rounded-md -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
