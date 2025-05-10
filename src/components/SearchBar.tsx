"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search...",
  className,
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Input
        placeholder={placeholder}
        className="w-full pr-10 p-5 bg-[#051728]/60 backdrop-blur-sm border-none text-white placeholder:text-[#83E9FF66] text-sm transition-all focus:ring-1 focus:ring-[#83E9FF]"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 text-[#83E9FF99] group-hover:text-[#83E9FF] transition-colors">
        <Search className="h-4 w-4" />
      </div>
    </div>
  );
}
