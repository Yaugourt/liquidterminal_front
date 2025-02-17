"use client"

import { Sidebar } from "@/components/Sidebar"
import { useSidebar } from "@/hooks/use-sidebar"

export function Providers({ children }: { children: React.ReactNode }) {
    const { isOpen, setIsOpen } = useSidebar()

    return (
        <>
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
            {children}
        </>
    )
} 