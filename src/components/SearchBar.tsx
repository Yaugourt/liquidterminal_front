"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search by address, tx hash or block...",
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  // Fonction pour identifier le type de recherche et rediriger
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) return;
    
    const trimmedValue = searchValue.trim();
    
    // 1. Vérifier si c'est un bloc (nombre uniquement)
    if (/^\d+$/.test(trimmedValue)) {
      router.push(`/explorer/block/${trimmedValue}`);
      return;
    }
    
    // 2. Vérifier si c'est une adresse Ethereum (42 caractères incluant 0x)
    // Les adresses Ethereum font généralement 42 caractères (0x + 40 caractères hexadécimaux)
    if (/^0x[a-fA-F0-9]{40}$/i.test(trimmedValue)) {
      router.push(`/explorer/address/${trimmedValue}`);
      return;
    }
    
    // 3. Vérifier si c'est un hash de transaction (66 caractères incluant 0x)
    // Les hash de transactions font généralement 66 caractères (0x + 64 caractères hexadécimaux)
    if (/^0x[a-fA-F0-9]{64}$/i.test(trimmedValue)) {
      router.push(`/explorer/transaction/${trimmedValue}`);
      return;
    }
    
    // 4. Si le format n'est pas reconnu mais commence par 0x, essayer comme une adresse
    if (trimmedValue.startsWith("0x")) {
      router.push(`/explorer/address/${trimmedValue}`);
      return;
    }
    
    // Si nous arrivons ici, le format n'est pas reconnu, on peut rediriger vers une page de recherche générale
    console.log("Format de recherche non reconnu:", trimmedValue);
  }, [searchValue, router]);

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Input
        placeholder={placeholder}
        className="w-full pr-10 p-5 bg-[#051728]/60 backdrop-blur-sm border-none text-white placeholder:text-[#83E9FF66] text-sm transition-all focus:ring-1 focus:ring-[#83E9FF]"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <button 
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 text-[#83E9FF99] hover:text-[#83E9FF] transition-colors cursor-pointer"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
