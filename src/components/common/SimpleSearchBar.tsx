"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleSearchBar({ 
  onSearch, 
  placeholder = "Search...", 
  className = "" 
}: SimpleSearchBarProps) {
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
    <div className={`relative w-full max-w-xs ${className}`}>
      <div className={`relative flex items-center w-full px-3 py-2 bg-[#051728E5] border rounded-lg transition-all ${
        isFocused 
          ? "border-[#83E9FF80] shadow-lg shadow-[#83E9FF20]" 
          : "border-[#83E9FF4D] hover:border-[#83E9FF80]"
      }`}>
        <Search 
          size={16} 
          className={`mr-2 transition-colors ${
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
            className="ml-2 h-5 w-5 text-gray-400 hover:text-white hover:bg-[#83E9FF20]"
          >
            <X size={12} />
          </Button>
        )}
      </div>
    </div>
  );
}
