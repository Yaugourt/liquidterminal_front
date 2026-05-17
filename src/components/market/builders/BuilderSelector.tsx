"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/common";
import { formatBuilderDisplayName } from "./formatBuilderDisplayName";
import type { BuilderListRow } from "@/services/indexer/builders/types";

interface BuilderSelectorProps {
  builders: BuilderListRow[];
  selectedAddress: string;
  onSelect: (address: string) => void;
}

export function BuilderSelector({ builders, selectedAddress, onSelect }: BuilderSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = builders.find((b) => b.address === selectedAddress);
  const displayName = selected ? formatBuilderDisplayName(selected.name) : "—";

  const filtered = builders.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const name = (b.name ?? "").toLowerCase();
    const addr = (b.address ?? "").toLowerCase();
    return name.includes(s) || addr.includes(s);
  });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass-panel px-4 py-3 flex items-center gap-3 min-w-64 hover:border-border-hover transition-all text-left"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-xs font-bold text-brand-accent shrink-0">
          {displayName !== "—" ? displayName.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-medium text-sm truncate">{displayName}</p>
          <p className="text-text-muted text-xs font-mono truncate">
            {selectedAddress ? `${selectedAddress.slice(0, 10)}…` : "—"}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 glass-panel border border-border-hover z-50 shadow-2xl">
          <div className="p-2 border-b border-border-subtle">
            <SearchBar
              onSearch={setSearch}
              placeholder="Search builder…"
              debounceMs={150}
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.slice(0, 50).map((b) => {
              const name = formatBuilderDisplayName(b.name);
              return (
                <button
                  key={b.address}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left ${
                    b.address === selectedAddress ? "bg-brand-accent/10" : ""
                  }`}
                  onClick={() => {
                    onSelect(b.address);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-brand-accent/10 flex items-center justify-center text-[10px] font-bold text-brand-accent shrink-0">
                    {name !== "—" ? name.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary text-sm truncate">{name}</p>
                    <p className="text-text-muted text-xs font-mono">{b.address.slice(0, 12)}…</p>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-text-muted text-sm text-center py-4">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
