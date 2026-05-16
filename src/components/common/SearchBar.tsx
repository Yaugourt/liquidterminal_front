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
                    "relative flex items-center w-full px-3 py-2 rounded-md transition-colors duration-200",
                    "bg-surface-2 border",
                    isFocused
                        ? "border-brand"
                        : "border-border-subtle hover:border-border-default"
                )}
            >
                <Search
                    size={14}
                    className={cn(
                        "mr-2 shrink-0 transition-colors duration-200",
                        isFocused ? "text-brand" : "text-text-tertiary"
                    )}
                />

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary text-sm outline-none w-full"
                />

                {query && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        className="ml-2 h-5 w-5 text-text-tertiary hover:text-text-primary hover:bg-surface-3 rounded p-0.5"
                    >
                        <X size={13} />
                    </Button>
                )}
            </div>
        </div>
    );
}
