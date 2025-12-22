"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
    initialValue?: string;
    debounceMs?: number;
}

export function SearchBar({
    onSearch,
    placeholder = "Search...",
    className,
    initialValue = "",
    debounceMs = 300
}: SearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);
    const firstRender = useRef(true);

    // Debounce search
    useEffect(() => {
        // Skip the first render to avoid triggering search on mount if empty
        if (firstRender.current) {
            firstRender.current = false;
            if (!initialValue) return;
        }

        const timeoutId = setTimeout(() => {
            onSearch(query);
        }, debounceMs);

        return () => clearTimeout(timeoutId);
    }, [query, onSearch, debounceMs, initialValue]);

    const handleClear = () => {
        setQuery("");
        onSearch("");
    };

    return (
        <div className={cn("relative w-full max-w-sm", className)}>
            <div
                className={cn(
                    "relative flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200",
                    "bg-brand-secondary/40 backdrop-blur-sm border",
                    isFocused
                        ? "border-brand-accent/50 shadow-[0_0_15px_-3px_rgba(131,233,255,0.15)]"
                        : "border-border-subtle hover:border-border-hover"
                )}
            >
                <Search
                    size={18}
                    className={cn(
                        "mr-3 transition-colors duration-200",
                        isFocused ? "text-brand-accent" : "text-text-muted"
                    )}
                />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-white placeholder:text-text-muted text-sm outline-none w-full"
                />

                {query && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="ml-2 h-6 w-6 text-text-muted hover:text-white hover:bg-white/5 rounded-full p-0.5"
                    >
                        <X size={14} />
                    </Button>
                )}
            </div>
        </div>
    );
}
