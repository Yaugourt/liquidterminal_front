"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useGlobalAliases } from "@/services/explorer";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search address, tx hash, block or alias...",
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { aliases } = useGlobalAliases();

  // Fonction pour trouver une adresse par alias
  const findAddressByAlias = useCallback((searchTerm: string): string | null => {
    if (!aliases) return null;

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Recherche exacte d'abord
    for (const [address, alias] of Object.entries(aliases)) {
      if (alias.toLowerCase() === lowerSearchTerm) {
        return address;
      }
    }

    // Recherche partielle ensuite
    for (const [address, alias] of Object.entries(aliases)) {
      if (alias.toLowerCase().includes(lowerSearchTerm)) {
        return address;
      }
    }

    return null;
  }, [aliases]);

  // Suggestions d'alias basées sur la saisie
  const suggestions = useMemo(() => {
    if (!aliases || !searchValue.trim() || searchValue.length < 2) return [];

    const searchTerm = searchValue.toLowerCase();
    const matches: Array<{ address: string; alias: string; score: number }> = [];

    Object.entries(aliases).forEach(([address, alias]) => {
      const aliasLower = alias.toLowerCase();

      // Score basé sur la position du match
      if (aliasLower.startsWith(searchTerm)) {
        matches.push({ address, alias, score: 100 });
      } else if (aliasLower.includes(searchTerm)) {
        matches.push({ address, alias, score: 50 });
      }
    });

    // Trier par score puis alphabétiquement, limiter à 5 résultats
    return matches
      .sort((a, b) => b.score - a.score || a.alias.localeCompare(b.alias))
      .slice(0, 5);
  }, [aliases, searchValue]);

  // Fonction pour identifier le type de recherche et rediriger
  const handleSearch = useCallback((searchTerm?: string) => {
    const valueToSearch = searchTerm || searchValue.trim();

    if (!valueToSearch) return;

    setShowSuggestions(false);
    setSelectedSuggestion(-1);

    // 1. Vérifier si c'est un bloc (nombre uniquement)
    if (/^\d+$/.test(valueToSearch)) {
      router.push(`/explorer/block/${valueToSearch}`);
      return;
    }

    // 2. Vérifier si c'est une adresse Ethereum (42 caractères incluant 0x)
    if (/^0x[a-fA-F0-9]{40}$/i.test(valueToSearch)) {
      router.push(`/explorer/address/${valueToSearch}`);
      return;
    }

    // 3. Vérifier si c'est un hash de transaction (66 caractères incluant 0x)
    if (/^0x[a-fA-F0-9]{64}$/i.test(valueToSearch)) {
      router.push(`/explorer/transaction/${valueToSearch}`);
      return;
    }

    // 4. Si le format n'est pas reconnu mais commence par 0x, essayer comme une adresse
    if (valueToSearch.startsWith("0x")) {
      router.push(`/explorer/address/${valueToSearch}`);
      return;
    }

    // 5. Chercher par alias
    const addressFromAlias = findAddressByAlias(valueToSearch);
    if (addressFromAlias) {
      router.push(`/explorer/address/${addressFromAlias}`);
      return;
    }

    // Si nous arrivons ici, le format n'est pas reconnu
  }, [searchValue, router, findAddressByAlias]);

  // Gestion des événements clavier
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
          e.preventDefault();
          handleSearch(suggestions[selectedSuggestion].address);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestion, handleSearch]);

  // Gestion de la saisie
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowSuggestions(value.trim().length >= 2);
    setSelectedSuggestion(-1);
  }, []);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className="w-full pr-10 p-5 glass-input text-white placeholder:text-text-muted text-sm rounded-xl"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchValue.trim().length >= 2 && setShowSuggestions(true)}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 text-brand-gold hover:text-brand-accent transition-colors cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-brand-secondary/95 backdrop-blur-sm border border-border-hover rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.address}
              type="button"
              className={`w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-none ${index === selectedSuggestion ? 'bg-white/5' : ''
                } ${index === 0 ? 'rounded-t-xl' : ''} ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                }`}
              onClick={() => handleSearch(suggestion.address)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-brand-gold text-sm font-medium">
                    {suggestion.alias}
                  </div>
                  <div className="text-brand-accent text-xs font-mono">
                    {suggestion.address.substring(0, 10)}...{suggestion.address.substring(suggestion.address.length - 8)}
                  </div>
                </div>
                <ChevronDown className="h-3 w-3 text-white/20 rotate-[-90deg]" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
