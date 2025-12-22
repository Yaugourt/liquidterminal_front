"use client"

import * as React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

export type TabOption = {
    value: string
    label: React.ReactNode
}

interface PillTabsProps {
    tabs: TabOption[]
    activeTab: string
    onTabChange: (value: string) => void
    layoutId?: string // Kept for API compatibility, not used
    className?: string
}

export function PillTabs({
    tabs,
    activeTab,
    onTabChange,
    className
}: PillTabsProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
    const [isInitialized, setIsInitialized] = useState(false)

    const updateIndicator = useCallback(() => {
        if (!containerRef.current) return

        const activeButton = containerRef.current.querySelector(
            `[data-tab-value="${activeTab}"]`
        ) as HTMLButtonElement | null

        if (activeButton) {
            const containerRect = containerRef.current.getBoundingClientRect()
            const buttonRect = activeButton.getBoundingClientRect()

            setIndicatorStyle({
                left: buttonRect.left - containerRect.left,
                width: buttonRect.width,
            })
            setIsInitialized(true)
        }
    }, [activeTab])

    useEffect(() => {
        updateIndicator()
        // Also update on window resize
        window.addEventListener('resize', updateIndicator)
        return () => window.removeEventListener('resize', updateIndicator)
    }, [updateIndicator])

    return (
        <div
            ref={containerRef}
            className={cn("relative flex items-center gap-1 p-1 bg-brand-dark/30 rounded-lg w-fit", className)}
        >
            {/* Animated indicator */}
            <div
                className={cn(
                    "absolute h-[calc(100%-8px)] bg-brand-accent rounded-md",
                    isInitialized ? "transition-all duration-300 ease-out" : ""
                )}
                style={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    opacity: isInitialized ? 1 : 0,
                }}
            />

            {tabs.map((tab) => {
                const isActive = activeTab === tab.value

                return (
                    <button
                        key={tab.value}
                        data-tab-value={tab.value}
                        onClick={() => onTabChange(tab.value)}
                        className={cn(
                            "relative px-4 py-1.5 text-sm font-medium transition-colors rounded-md z-10",
                            isActive ? "text-brand-tertiary" : "text-text-secondary hover:text-white"
                        )}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
