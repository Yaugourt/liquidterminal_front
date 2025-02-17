"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchBarProps {
    placeholder?: string
    className?: string
}

export function SearchBar({ placeholder = "Search...", className }: SearchBarProps) {
    return (
        <div className={`relative ${className} w-[300px]`}>
            <Input
                placeholder={placeholder}
                className="w-full pr-10 bg-[#051728] border-none text-white placeholder:text-muted-foreground"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
    )
}