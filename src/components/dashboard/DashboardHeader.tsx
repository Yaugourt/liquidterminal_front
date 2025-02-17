"use client"

import { usePageTitle } from "@/store/use-page-title"
import { SearchBar } from "@/components/SearchBar"
import Image from "next/image"

export function DashboardHeader() {
    const { title } = usePageTitle()

    return (
        <div className="relative">
            <div className="hidden lg:block w-full absolute top-0">
                <Image
                    src="/waveheader.svg"
                    alt="Wave header"
                    width={1920}
                    height={144}
                    className="w-full"
                />
            </div>
            <header className="hidden lg:block p-4 relative z-10">
                <div className="flex items-center">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <SearchBar />
                    </div>
                </div>
            </header>
        </div>
    )
} 