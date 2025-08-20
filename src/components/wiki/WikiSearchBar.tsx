"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface WikiSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function WikiSearchBar({ onSearch, placeholder = "Search in resources...", className = "" }: WikiSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search to avoid too many calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <div className={`relative flex items-center w-full px-4 py-3 bg-[#051728E5] border rounded-lg transition-all ${
        isFocused 
          ? "border-[#83E9FF80] shadow-lg shadow-[#83E9FF20]" 
          : "border-[#83E9FF4D] hover:border-[#83E9FF80]"
      }`}>
        <Search 
          size={18} 
          className={`mr-3 transition-colors ${
            isFocused ? "text-[#83E9FF]" : "text-gray-400"
          }`} 
        />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm outline-none"
        />
        
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="ml-2 h-6 w-6 text-gray-400 hover:text-white hover:bg-[#83E9FF20]"
          >
            <X size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
